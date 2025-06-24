import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import connectDB from "./db/index.js"
import {User} from "./models/user.models.js"
import mongoose from "mongoose"
import { verifyToken } from "./middleware/auth.js"

const app = express()
app.use(express.json())




app.get("/id",(req,res)=>{

})


//lets user login
app.post("/api/auth/login",(req,res)=>{
    const [name,email,password] = req.body;
})

//lets user register
app.post("/api/auth/register",verifyToken,async(req,res)=>{
    const {name,email,password} = req.body;

    if(!name && !email){
        req.status(401).json("User must provide name and email !! ")
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password,saltRounds);

    const user = await User.create({
        name,
        email,
        password : hashedPassword,
    })

    const createdUser = await User.findOne(user._id);
    if(!createdUser){
        console.log("User not created ");
        
    }

    res.status



})

connectDB();

app.listen(3000,()=>{
    console.log("server running on port 3000");
    
})