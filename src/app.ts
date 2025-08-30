import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import mongooseConnection from "./config/database_config";
import doctorRouter from './routes/doctorRoutes'
import adminRouter from './routes/adminRoutes'
import cookieParser from "cookie-parser";
import { startSocket } from "./socketConfig";
import path from "node:path";
import { devLogger, prodLogger } from "./middlewares/logger";
const socketIo = require('socket.io')
const http = require('http');
const app: Application = express();

// dotenv.config();


dotenv.config({
  path: path.resolve(
    __dirname,
    process.env.NODE_ENV === "production" ? "../.env.production" : "../.env.development"
  ),
});



if ((process.env.NODE_ENV ?? "").trim() === "production") {
  console.log("✅ Logger in PRODUCTION mode — writing to logs/access.log");
  app.use(prodLogger);
} else {
  console.log("🛠 Logger in DEVELOPMENT mode — logging to console");
  app.use(devLogger);
}



mongooseConnection();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    // origin: "https://home-care-frontend-five.vercel.app",
    origin: "http://localhost:1234",
    methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    // allowedHeaders: 'Content-Type, Authorization', // Allowed headers
    credentials: true // Allow credentials (cookies, HTTP authentication)
  })
);

//socket
const server = http.createServer(app);

console.log("bfr");
startSocket(server)
console.log("aftr");

app.use("/", userRouter);
app.use("/doctors", doctorRouter)
app.use("/admin", adminRouter)



const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// server.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server is running on http://0.0.0.0:${PORT}`);
// });
