import mongoose from "mongoose";
const noteSchema = new mongoose.Schema({
    title:{
        type: String,
        require: true
    },
    content:{
        type: String,
        require: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "User",
        require : true
    },
    isComepleted : {
        type : Boolean,
        require : true
    }
},{timestamps : true})

export const Note = mongoose.model("Note",noteSchema);