import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const uri = process.env.DATABASE_URL;

const connectDb = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Book database connected....");
    } catch (e) {
        console.log(e)
    }
}


export default connectDb