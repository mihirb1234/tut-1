// db/index.js
import mongoose from "mongoose";
import DB_NAME from "../constants.js";
//async function hai connectDB takes some time to connect thats why
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host} `);
    } catch (error) {
        console.log("MONGODB CONNECTION ERROR: ", error);
        process.exit(1);
    }
};

export default connectDB;