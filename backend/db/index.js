import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB'+connectionInstance.connection.host);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

export default connectDB;