import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import mongooseConnection from "./config/database_config";
import doctorRouter from './routes/doctorRoutes'
import adminRouter from './routes/adminRoutes'
import cookieParser from "cookie-parser";

const app: Application = express();

dotenv.config();


mongooseConnection();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:1234",
    methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    // allowedHeaders: 'Content-Type, Authorization', // Allowed headers
    credentials: true // Allow credentials (cookies, HTTP authentication)
  })
);

app.use("/", userRouter);
app.use("/doctors", doctorRouter)
app.use("/admin", adminRouter)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
