import cookieParser from "cookie-parser";
import express from "express";
import { engine } from "express-handlebars";
import {
  methods as authentication,
  getUserTasks,
  fetchFromFile, 
  addTask
} from "./controllers/authentication.js";
import { methods as authorization } from "./middlewares/authorization.js";
import {getLoggedInUser} from "./controllers/auth.js"
import jsonwebtoken from "jsonwebtoken";

// For static file path resolution in ES Modules, we compute __dirname
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Create the Express server
const server = express();
server.set("PORT", PORT);
console.log("Server listen to PORT", server.get("PORT"));

server.engine(
  "handlebars",
  engine({
    helpers: {
      eq: (a, b) => a === b,
    },
  })
);
server.set("view engine", "handlebars");
server.set("views", "./views");

// Setup static files using the computed __dirname for reliability
server.use(express.static(path.join(__dirname, "public")));
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(cookieParser());

// Endpoints

server.get("/", authorization.onlyPublic, (req, res, next) =>
  res.render("login")
);

server.post("/api/login", authorization.onlyPublic, authentication.login);

server.get("/myTasks", authorization.onlyAdmin, async (req, res, next) => {
  try {
    const username = getLoggedInUser(req);
    
    if (!username) {
      return res.redirect("/");
    }
    const users = await fetchFromFile();
    const tasks = getUserTasks(users, username);

    res.render("user-tasks", { tasks, user: username });
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    res.status(500).send("Internal Server Error");
  }
});

server.get("/addTask", authorization.onlyAdmin, (req, res, next)=> {
  res.render("task-form")
})

server.post("/api/addTasks", authorization.onlyAdmin, addTask)

server.get("/editTask/:id",  (req,res, next)=> {
  const {id} = req.params;
  const users = fetchFromFile();
  const loggedUser = getLoggedInUser();
  const tasks = getUserTasks(users, loggedUser);
  const task = tasks.find(t => t.id == id)

  if(!task){
    return res.render('404', {message: 'Task not found'})
  }

  res.render("edit-task", { task })
})

// 404 
server.use((req, res, next) => {
  res.render("404");
});

// 500 
server.use((err, req, res, next) => {
  console.log(err);
  res.render("500");
});

// Start the server
server.listen(server.get("PORT"));
