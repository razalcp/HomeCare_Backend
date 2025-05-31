import { Router } from 'express'
import express from 'express'
import AdminController from '../controllers/admin/adminController'
import AdminService from '../services/adminService'
import AdminReprository from '../repositories/adminReprository'
import AdminModel from '../models/admin/adminModel'
import DoctorController from '../controllers/doctor/doctorController'
import DepartmentModel from '../models/admin/departmentModel'
import DoctorModel from '../models/doctor/doctorModel'
import User from '../models/user/userModel'
import adminAuthMiddleware from '../middlewares/jwtAuthAdmin'
import adminWalletModel from '../models/admin/adminWalletModel'
import doctorWalletModel from '../models/doctor/doctorWalletModel'
import BookingModel from '../models/user/bookingModel'

const router = express.Router()


const adminReprository = new AdminReprository(AdminModel, DepartmentModel, DoctorModel as any, User, adminWalletModel as any,doctorWalletModel as any, BookingModel as any)
const adminService = new AdminService(adminReprository)
const adminController = new AdminController(adminService)


router.post('/adminLogin', adminController.adminLogin)
router.post('/addDepartments', adminController.addDepartments)
router.get('/getDepartments', adminAuthMiddleware, adminController.getDepartments)
router.get('/getWalletData/:adminId', adminAuthMiddleware, adminController.getWalletData)
router.patch('/updateListUnlist', adminAuthMiddleware, adminController.updateListUnlist)
router.get('/getDoctorData', adminAuthMiddleware, adminController.getDoctors)
router.patch('/updateKycStatus', adminAuthMiddleware, adminController.updateKycStatus)
router.get('/getPatients', adminAuthMiddleware, adminController.getPatients)
router.patch('/updateIsBlocked', adminAuthMiddleware, adminController.updateuserIsBlocked)
router.post('/adminLogout', adminController.logoutAdmin)
router.get("/dashBoardData",adminAuthMiddleware, adminController.findDashBoardData)

export default router;




