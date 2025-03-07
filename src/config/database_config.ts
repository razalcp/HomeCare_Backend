import mongoose from "mongoose";

const mongooseConnection = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);



    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Error connecting to MongoDB", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Disconnected from MongoDB");
    });

  } catch (error) {
    console.error(
      "Database connection failed:",
      error instanceof Error ? error.message : error
    );
    process.exit(1); // Exit the process if connection fails
  }
};

const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log("Mongoose disconnected through app termination");
    process.exit(0); // Exit the process after disconnecting
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1); // Exit the process with error code
  }
};

// Listen for process termination signals to clean up resources
process.on("SIGINT", gracefulShutdown); // For process termination
process.on("SIGTERM", gracefulShutdown); // For process termination in production

export default mongooseConnection;
