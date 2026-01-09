import mongoose from "mongoose";
import { MONGO_NAME } from "../constant.js";



const connectDB = async () => {
    try {
        const connectionInstant = await mongoose.connect(`${process.env.MONGODB_URI}/${MONGO_NAME}`)
        console.log(connectionInstant.connection.host);
        console.log("mongodb connected successfully")


    } catch (error) {
        console.log("error in connection of mongodb", error);
    }
}

export default connectDB;