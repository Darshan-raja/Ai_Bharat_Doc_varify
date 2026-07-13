import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const isLocalMongoUri = (uri) => {
    if (!uri) {
        return false;
    }

    return uri.includes('localhost') || uri.includes('127.0.0.1') || uri.includes('::1');
};

const connectDb = async () => {
    if (process.env.NODE_ENV !== 'production' && isLocalMongoUri(process.env.MONGO_URI)) {
        process.env.USE_MOCK_DB = 'true';
        mongoose.set('bufferCommands', false);
        console.warn('Local MongoDB URI detected. Using the in-memory dev store for auth endpoints.');
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.env.USE_MOCK_DB = 'true';
        console.warn('Continuing with the in-memory dev store so auth endpoints remain usable.');
    }
}
export default connectDb;