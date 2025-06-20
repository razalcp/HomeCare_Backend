import { Router } from 'express'
import express from 'express'
import DoctorController from '../controllers/doctor/doctorController'
import DoctorService from '../services/doctorService'
import DoctorReprository from '../repositories/doctorReprository'

import DoctorModel from '../models/doctor/doctorModel'
import upload from '../config/multer_config'
import DepartmentModel from '../models/admin/departmentModel'
import doctorAuthMiddleware from '../middlewares/jwtAuthDoctor'
import SlotModel from '../models/doctor/slotModel'
import BookingModel from "../models/user/bookingModel";
import doctorWalletModel from '../models/doctor/doctorWalletModel'
import messageModel from '../models/messageModel'
import conversationModel from '../models/conversationModel'
import PrescriptionModel from '../models/doctor/prescriptionModel'
import User from '../models/user/userModel'

const router = express.Router()
const doctorReprository = new DoctorReprository(DoctorModel as any, DepartmentModel, SlotModel as any, BookingModel as any, doctorWalletModel as any, messageModel as any, conversationModel as any, PrescriptionModel as any, User)
const doctorService = new DoctorService(doctorReprository)
const doctorController: any = new DoctorController(doctorService)

router.post('/register', doctorController.register);
router.post('/verifyOtp', doctorController.verifyOtp);
router.post('/doctorKyc', upload.any(), doctorController.doctorRegister);
router.get('/getDepartments', doctorController.getDepartments);
router.post('/doctorLogin', doctorController.doctorLogin);
router.post('/verifyDoctorOtp', doctorController.verifyDoctorOtp);
router.patch('/updateDoctorProfile', doctorAuthMiddleware, upload.any(), doctorController.updateDoctor);
router.post('/doctorLogout', doctorController.logoutDoctor);
router.post('/addDoctorSlots', doctorAuthMiddleware, doctorController.addDoctorSlots);
router.get("/availableDoctorSlots/:doctorId", doctorAuthMiddleware, doctorController.getDoctorSlots);
router.get("/availableDoctorSlotsForBooking/:doctorId", doctorAuthMiddleware, doctorController.getDoctorSlotsForBooking)
router.post('/getMyBookings', doctorAuthMiddleware, doctorController.getMyBookings);
router.get('/getWalletData/:doctorId', doctorAuthMiddleware, doctorController.getWalletData);
router.get('/bookedUsers', doctorAuthMiddleware, doctorController.bookedUsers)
router.post('/saveMessages', doctorAuthMiddleware, upload.any(), doctorController.saveMessages)
router.get('/messages', doctorAuthMiddleware, doctorController.messages)
router.delete('/deleteSlot/:slotId', doctorAuthMiddleware, doctorController.deleteSlot)
router.post('/savePrescription', doctorAuthMiddleware, doctorController.savePrescription)
router.get('/prescription', doctorAuthMiddleware, doctorController.getPrescription)
router.get('/doctorDashBoard', doctorAuthMiddleware, doctorController.doctorDashBoard)
router.patch('/editDepartment', doctorAuthMiddleware, doctorController.updateDepartment)
export default router;