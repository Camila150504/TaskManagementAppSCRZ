import jsonwebtoken from "jsonwebtoken";

export function getLoggedInUser(req) {
  try {
    const cookieJWT = req.headers.cookie
      ?.split("; ")
      .find((cookie) => cookie.startsWith("jwt="))
      ?.slice(4); 

    if (!cookieJWT) {return null;} 

    
    const {user} = jsonwebtoken.verify(cookieJWT, process.env.JWT_SECRET);
    return user; 
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
}
