import  jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import { fetchFromFile } from "../controllers/authentication.js";

dotenv.config();

async function onlyAdmin(req, res, next){
    const logged = await checkCookie(req);

    /*
    if(logged) return next();
    return res.redirect("/"); */
    if (logged) {
        return next();
    } else if (req.originalUrl !== "/") { 
        return res.redirect("/"); // Prevents infinite loop
    } else {
        return res.status(403).send("Unauthorized");
    }
}

async function onlyPublic(req, res, next){
    const logged = await checkCookie(req);
    /*
    if(!logged) return next();
    return res.redirect("/");*/
    if (!logged) {
        return next();
    } else if (req.originalUrl !== "/myTasks") { 
        return res.redirect("/myTasks"); // Prevents infinite loop
    } else {
        return res.status(403).send("Unauthorized");
    }
}

async function checkCookie(req){

    try{
        const cookieJWT = req.headers.cookie.split("; ").find(cookie => cookie.startsWith("jwt=")).slice(4);
        const decoded =  jsonwebtoken.verify(cookieJWT,process.env.JWT_SECRET);
        
        let users  = await fetchFromFile();
        const userToTest = users.find(u => u.user === decoded.user )
        console.log(userToTest)
    
        if(!userToTest){
            return false
        }
        return true;
    }catch{
        return false;
    }

}

export const methods ={
    onlyAdmin,
    onlyPublic
}