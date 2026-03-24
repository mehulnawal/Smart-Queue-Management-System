import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();

const newConnection = async () => {

    try {
        const connection = await mongoose.connect(`${process.env.DB_CONNECTION_STRING}`);

        console.log(`Connection Host - ${connection.connection.host}`)

    } catch (error) {
        console.log(`Error in connecting to DB - ${error.message}`)
        throw new Error(`Something went wrong - ${error.message}`);
    }
}

export default newConnection;