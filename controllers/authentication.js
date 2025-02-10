import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";
import {getLoggedInUser}  from './auth.js';

dotenv.config();

const DIR = process.cwd();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function fetchFromFile() {
  try {
    const filePath = path.join(__dirname, "assets", "tasksperuser.json");

    const data = await fs.promises.readFile(filePath, "utf8");

    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}

export function saveUsers(users) {
  try {
    fs.writeFileSync(
      DIR + "/controllers/assets/tasksperuser.json",
      JSON.stringify(users, null, 4)
    );
  } catch (error) {
    console.error("Error saving users file:", error);
  }
}

//fin con fs

async function login(req, res) {
  console.log(req.body);
  const user = req.body.user;
  const password = req.body.password;

  //from my function
  let users = await fetchFromFile();

  if (!user || !password) {
    return res
      .status(400)
      .send({ status: "Error", message: "There are empty fields" });
  }
  const userToTest = users.find((u) => u.user === user);

  if (!userToTest) {
    const salt = await bcryptjs.genSalt(5);
    const hashPassword = await bcryptjs.hash(password, salt);

    const newUser = {
      user,
      password: hashPassword,
      tasks: [],
    };
    users.push(newUser);
    saveUsers(users);

    const token = jsonwebtoken.sign(
      { user: newUser.user },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    const cookieOption = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      path: "/",
    };
    res.cookie("jwt", token, cookieOption);
    //

    console.log(users);
    console.log("Your user has been created.");
    return res
      .status(201)
      .send({
        status: "ok",
        message: `User ${newUser.user} added`,
        redirect: "/myTasks",
      });
  } else {
    const checkLogin = await bcryptjs.compare(password, userToTest.password);
    if (!checkLogin) {
      return res
        .status(400)
        .send({ status: "Error", message: "User and password do not match" });
    }

    const token = jsonwebtoken.sign(
      { user: userToTest.user },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    const cookieOption = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      path: "/",
    };
    res.cookie("jwt", token, cookieOption);
    console.log("Login successfully!");
    res.send({
      status: "ok",
      message: "User Logged in ",
      redirect: "/myTasks",
    });
  }
}


async function register(req, res) {}



// tasks

export function getUsers(fetchUsers) {
  return fetchUsers();
}

/**
 * Get tasks of a specific user
 */

export function getUserTasks(users, username) {
  const user = users.find((u) => u.user === username);
  return user ? user.tasks : [];
}

/**
 * Filter tasks based on a property and value
 */
export function filterTasks(tasks, property, value) {
  return tasks.filter(
    (task) => task[property].toLowerCase() === value.toLowerCase()
  );
}

/**
 * Filter tasks with a custom filter logic
 */
export function filterTaskList(tasks, property, value, filterLogic) {
  return tasks.filter((task) => filterLogic(task, property, value));
}

/**
 * Filtering logic: Check if property equals value
 */
export function propertyEqualsToValue(task, property, value) {
  return task[property].toLowerCase() === value.toLowerCase();
}

/**
 * Filtering logic: Check if dueDate is before a certain date
 */
export function propertyDueBefore(task, property, value) {
  return new Date(task[property]) < new Date(value);
}



/**
 * Add a new task to a user's list
 */
export async function addTask(req, res) {
  try {

    const user = getLoggedInUser(req);

    if (!user) {
      return res.status(401).send({ status: "Error", message: "Unauthorized" });
    }

    const { title, description, priority, dueDate } = req.body;

    if (!title || !description || !priority || !dueDate) {
      return res.status(400).send({ status: "Error", message: "Missing fields" });
    }

    let users = await fetchFromFile();
    let userToModify = users.find((u) => u.user === user);

    if (!userToModify) {
      return res.status(404).send({ status: "Error", message: "User not found" });
    }

    const lastTask = userToModify.tasks.length
      ? userToModify.tasks[userToModify.tasks.length - 1]
      : { id: "0" };
    const newTaskId = (parseInt(lastTask.id) + 1).toString();

    const newTask = {
      id: newTaskId,
      title,
      description,
      priority,
      dueDate,
      status: "Pending",
    };

    userToModify.tasks.push(newTask);
    saveUsers(users);

     return res.status(201).send({
      status: "ok",
      message: "Task added successfully",
      task: newTask,
      redirect: "/myTasks",
    });
  } catch (error) {
    console.error("Task addition failed:", error);
    res.status(500).send({ status: "Error", message: "Internal Server Error" });
  }
}

export async function updateTask(req, res){

  console.log("aquí está")
  try {

    const user = getLoggedInUser(req);

    if (!user) {
      return res.status(401).send({ status: "Error", message: "Unauthorized" });
    }

    const { title, description, priority, dueDate, status } = req.body;

    if (!title || !description || !priority || !dueDate || !status) {
      return res.status(400).send({ status: "Error", message: "Missing fields" });
    }

    let users = await fetchFromFile();
      const tasks = getUserTasks(users, loggedUser);
      const id = req.params.id;

      tasks[id] = {
        ...req.body
      };

    saveUsers(users);

     return res.status(200).send({
      status: "ok",
      message: "Task updated successfully",
      task: newTask,
      redirect: "/myTasks",
    });

  } catch (error) {
    console.error("Task update failed:", error);
    res.status(500).send({ status: "Error", message: "Internal Server Error" });
  }
}

/*
export function saveUsersToFile(users) {
  try {
    fs.writeFileSync(
      DIR + "/assets/tasksperuser.json",
      JSON.stringify(users, null, 2)
    );
  } catch (error) {
    console.error("Error saving tasks file:", error);
  }
}*/

export const methods = {
  login,
  register,
  addTask
};