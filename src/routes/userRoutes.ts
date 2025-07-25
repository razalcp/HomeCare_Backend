import { Router } from "express";
import express from "express";
import UserController from "../controllers/user/userController";
import UserService from "../services/userService";
import UserReprository from "../repositories/userReprository";
import User from "../models/user/userModel";
import DoctorModel from "../models/doctor/doctorModel";
import { IDoctor } from "../models/doctor/doctorModel";
import authMiddleware from "../middlewares/jwtAuth";
import SlotModel from "../models/doctor/slotModel";
import BookingModel from "../models/user/bookingModel";
import doctorWalletModel from "../models/doctor/doctorWalletModel";
import AdminWalletModel from "../models/admin/adminWalletModel";
import userWalletModel from "../models/user/userWalletModel";
import upload from '../config/multer_config'
import conversationModel from '../models/conversationModel'
import messageModel from '../models/messageModel'
import ReviewModel from "../models/user/reviewModel";
import PrescriptionModel, { IPrescription } from '../models/doctor/prescriptionModel'


const userReprository = new UserReprository(User, DoctorModel as any, SlotModel as any, BookingModel as any, doctorWalletModel as any, AdminWalletModel as any, userWalletModel as any, conversationModel as any, messageModel as any, ReviewModel as any,PrescriptionModel as Modal<IPrescription>);
const userService = new UserService(userReprository as any);
const userController = new UserController(userService);

const router = express.Router();

router.post("/signup", userController.register);
router.post("/verifyOtp", userController.otpVerification)
router.get("/resendOtp", userController.resendOtp)
router.post("/login", userController.login)
router.get('/getVerifiedDoctors', authMiddleware, userController.getVerifiedDoctors)
router.post('/userLogout', userController.logoutUser)

router.post('/create-checkout-session', authMiddleware, userController.createcheckoutsession)
router.post('/saveBooking', authMiddleware, userController.saveBookingToDb)
router.post('/getUserBookings', authMiddleware, userController.getUserBookings)
router.post('/cancelBooking', authMiddleware, userController.cancelBooking)
router.get('/getWalletData/:userId', authMiddleware, userController.getWalletData)
router.patch('/updateUserProfile', authMiddleware, upload.any(), userController.updateUser as any)
router.get("/getUser/:email", authMiddleware, userController.getUser);
router.get('/bookedDoctors', authMiddleware, userController.bookedDoctors)
router.get('/messages', authMiddleware, userController.messages)
router.post('/saveMessages', authMiddleware, userController.saveMessages)
router.post('/uploadToCloudinary', authMiddleware, upload.any(), userController.uploadImage)
router.delete('/deleteMessage', authMiddleware, userController.deleteMessage)
router.post('/walletBooking', authMiddleware, userController.walletBooking)
router.post('/submitReview', authMiddleware, userController.submitReview)
router.get('/reviewDetails', authMiddleware, userController.reviewDetails)
router.get('/findDoctorSlots/:doctorId', authMiddleware, userController.getDoctorSlotsForBooking)
router.get('/prescription', authMiddleware, userController.getPrescription)
export default router;
