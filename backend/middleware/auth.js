import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config()

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({ error: "No Auth header found" });
    } 
    const token = authHeader.split(" ")[1];
    try {
        const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(!verifiedToken){
            return res.status(401).json({ error: "Error while verifying the token" });
        }
        req.user = verifiedToken;
        next();
    } catch (error) {
        console.log("Token not verified ", error);
        return res.status(401).json({ error: "Invalid token" });
    }
};

/*
extract authheader from incoming request req.headres.authorization
auth token starts with Bearer !@
split that authtoken into two parts 1.Bearer 2.!@# we have to take the second one 
verify the token using jwt.verify()
attach the info in req.user
*/