import mongoose from "mongoose";
const uri =
  "mongodb://localhost:27017/library";


const connectDb = async () => {
  try{
    await mongoose.connect(uri);
    console.log("Database connected....");
  }catch(e){
    console.log(e)
  }
}


export default connectDb