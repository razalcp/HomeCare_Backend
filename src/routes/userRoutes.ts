import { Router } from "express";
import express from "express";
import UserController from "../controllers/user/userController";
import UserService from "../services/userService";
import UserReprository from "../repositories/userReprository";
import User from "../models/user/userModel";
import DoctorModel from "../models/doctor/doctorModel";
import { IDoctor } from "../models/doctor/doctorModel";
import authMiddleware from "../middlewares/jwtAuth";

const userReprository = new UserReprository(User, DoctorModel as any);
const userService = new UserService(userReprository as any);
const userController = new UserController(userService);

const router = express.Router();

router.post("/signup", userController.register);
router.post("/verifyOtp", userController.otpVerification)
router.get("/resendOtp", userController.resendOtp)
router.post("/login", userController.login)
router.get('/getVerifiedDoctors', authMiddleware, userController.getVerifiedDoctors)
router.post('/userLogout',userController.logoutUser)
// router.post("/create-payment-intent",userController.createPaymentIntent)
router.post('/create-checkout-session',authMiddleware,userController.createcheckoutsession)
export default router;
