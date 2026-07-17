import mongoose from "mongoose";
export default async function connectDB(): Promise<void> { const uri = process.env.MONGODB_URI; if (!uri) throw new Error("MONGODB_URI is not configured"); mongoose.set("strictQuery", true); await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000, maxPoolSize: 20 }); console.log(`MongoDB connected: ${mongoose.connection.host}`); }
