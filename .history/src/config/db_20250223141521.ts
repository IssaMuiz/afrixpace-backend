import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting mongoDB", error);
    process.exit(1);
  }
};

export default connectDB;
