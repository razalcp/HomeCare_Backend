import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import mongooseConnection from "./config/database_config";
import doctorRouter from './routes/doctorRoutes'
import adminRouter from './routes/adminRoutes'
import cookieParser from "cookie-parser";
// import messageRoutes from "./routes/messageRoutes.js";
import { startSocket } from "./socketConfig";

const socketIo = require('socket.io')
const http = require('http');
const app: Application = express();

dotenv.config();


mongooseConnection();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: "https://home-care-frontend-five.vercel.app",
    // origin: "http://localhost:1234",
    methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    // allowedHeaders: 'Content-Type, Authorization', // Allowed headers
    credentials: true // Allow credentials (cookies, HTTP authentication)
  })
);

//socket
const server = http.createServer(app);
startSocket(server)


// app.use("/", userRouter);
// app.use("/doctors", doctorRouter)
// app.use("/admin", adminRouter)

app.use("/api", userRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
