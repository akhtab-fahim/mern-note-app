import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        reuired : true,
    },
    email:{
        type: String,
        reuired : true,
        unique : true
    },
    password:{
        type: String,
        reuired : true,
    }
},{timestamps:true})

export const User = mongoose.model("User",userSchema)