import morgan from "morgan";
import fs from "fs";
import path from "path";


// Create logs directory if it doesn't exist
const logDirectory = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Create a write stream for logs (append mode)
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" }
);

// Development logger (colorful output in console)
export const devLogger = morgan("dev");

// Production logger (detailed logs saved to file)
export const prodLogger = morgan("combined", { stream: accessLogStream });
