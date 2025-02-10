import jsonwebtoken from "jsonwebtoken";

export function getLoggedInUser(req) {
  try {
    const cookieJWT = req.headers.cookie
      ?.split("; ")
      .find((cookie) => cookie.startsWith("jwt="))
      ?.slice(4); 

      console.log(cookieJWT)

    if (!cookieJWT) {return null;} 

    
    const decoded = jsonwebtoken.verify(cookieJWT, process.env.JWT_SECRET);
    return decoded.user; 
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
}
