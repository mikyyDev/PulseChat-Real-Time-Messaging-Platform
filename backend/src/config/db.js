import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri || !/^mongodb(?:\+srv)?:\/\//i.test(mongoUri)) {
    console.error(
      'Invalid or missing MONGO_URI. It must start with "mongodb://" or "mongodb+srv://".',
    );
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, { dbName: "pulsechat" });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
