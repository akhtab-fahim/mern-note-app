import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./db/index.js"
import {User} from "./models/user.models.js"
import mongoose from "mongoose"
import { verifyToken } from "./middleware/auth.js"
import { Note } from "./models/note.models.js";

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



dotenv.config();

//testing route
app.get("/test",verifyToken,(req,res)=>{
    return res.status(200).json({message : "Testing protected Route"})
})


//get all notes under one User
app.get("/note/getAllNotes/:userId", verifyToken, async (req, res) => {
    const { userId } = req.params;

    if (req.user.id !== userId) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    try {
        const notes = await Note.aggregate([
            { $match: { author: new mongoose.Types.ObjectId(userId) } },
            { $sort: { createdAt: -1 } }
        ]);
        res.status(200).json({ notes });
    } catch (err) {
        console.error("Error fetching notes:", err);
        res.status(500).json({ message: "Failed to fetch notes", error: err.message });
    }
});

//make a note
app.post("/note/writeNote", verifyToken, async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: "Title and Content are required" });
    }

    try {
        const note = await Note.create({
            title,
            content,
            author: req.user.id,
            isCompleted: false    
        });

        res.status(201).json({ note, message: "Note created successfully" });

    } catch (err) {
        console.error("Error creating note:", err);
        res.status(500).json({ message: "Failed to create note", error: err.message });
    }
});

//update a note
app.patch("/note/updateNote/:noteId",verifyToken,async(req,res)=>{
    const {noteId} = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: "Title and Content are required" });
    }

    const note = await Note.findById(noteId);

    if(!note){
        return res.status(500).json({ message: "No note exists"});
    }

    const updatedNote = await Note.findByIdAndUpdate(noteId,{$set:{
        title : title,
        content : content
    }},{new:true})

    return res.status(200).json({updatedNote, message: "Note updated succesfully "});
})

//delete a note
app.delete("/note/deleteNote/:noteId",verifyToken,async(req,res)=>{
    const {noteId} = req.params;
    const note = await Note.findById(noteId);
    if(!note){
        return res.status(500).json({ message: "No note exists"});
    }
    await Note.findByIdAndDelete(noteId);
    return res.status(200).json({ message: "Note deleted succesfully "});
})


//lets user login
app.post("/api/auth/login",async(req,res)=>{
    const {name,email,password} = req.body;

    if(!name || !email){
        return res.status(400).json({message : "Name or Email Field is required !! "})
    }

    const user = await User.findOne({$or: [{ email }, { name }]});

    if(!user){
        return res.status(400).json({message : "No user exists corresponding to the email or name "})
    }

    const isPasswordCorrect = await bcrypt.compare(password,user.password);
    console.log(isPasswordCorrect);

    if(isPasswordCorrect){
        const options = {
            httpOnly : true,
            secure : true   
        }
    
        const accessToken = jwt.sign({id : user._id,name: user.name},process.env.ACCESS_TOKEN_SECRET,{expiresIn: process.env.ACCESS_TOKEN_EXPIRY});
    
        res
        .cookie("accessToken",accessToken,options)
        .status(200)
        .json({user,message : "User succesfully logged In"});
    }
    res
        .status(401)
        .json({message : "Password incorrect Login failed"});
})

//lets user register
app.post("/api/auth/register",async(req,res)=>{
    console.log(req.body);
    
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        return res.status(401).json("User must provide name and email and password !! ")
    }

    const existedUser = await User.findOne({$or: [{ email }, { name }]});

    if(existedUser){
        // console.log(email);
        return res.status(401).json("User already exists");
    }


    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password,saltRounds);

    const user = await User.create({
        name,
        email,
        password : hashedPassword,
    })

    const createdUser = await User.findById(user._id).select("-password");
    if(!createdUser){
        console.log("User not created ");  
        return res.status(401).json("User not created");  
    }
    const accessToken = jwt.sign({id: user._id,name: user.name},process.env.ACCESS_TOKEN_SECRET,{expiresIn : process.env.ACCESS_TOKEN_EXPIRY})

     const options = {
        httpOnly : true,
        secure : true   
    }

    res
    .cookie("accessToken",accessToken,options)
    .status(200)
    .json({createdUser,message : "User succesfully registered"});

})

connectDB();

app.listen(3000,()=>{
    console.log("server running on port 3000");
    
})