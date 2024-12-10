import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// console.log(`${process.env.MONGODB_URI}/${DB_NAME}`)

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
  } catch (err) {
    console.error("Mongo connection error", err);
    process.exit(1);
  }
};

export default connectDB;