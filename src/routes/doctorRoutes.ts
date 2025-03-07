import { Router } from 'express'
import express from 'express'
import DoctorController from '../controllers/doctor/doctorController'
import DoctorService from '../services/doctorService'
import DoctorReprository from '../repositories/doctorReprository'

import DoctorModel from '../models/doctor/doctorModel'
import upload from '../config/multer_config'
import DepartmentModel from '../models/admin/departmentModel'
const router = express.Router()
const doctorReprository = new DoctorReprository(DoctorModel, DepartmentModel)
const doctorService = new DoctorService(doctorReprository)
const doctorController = new DoctorController(doctorService)

router.post('/register', doctorController.register)
router.post('/verifyOtp', doctorController.verifyOtp)
router.post('/doctorKyc', upload.any(), doctorController.doctorRegister)
router.get('/getDepartments', doctorController.getDepartments)
router.post('/doctorLogin', doctorController.doctorLogin)
router.post('/verifyDoctorOtp', doctorController.verifyDoctorOtp)
router.patch('/updateDoctorProfile', upload.any(), doctorController.updateDoctor)

// router.post('/doctorKyc',doctorController.doctorKycRegister)


export default router