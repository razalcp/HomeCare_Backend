

import { Request, Response } from 'express'
import DoctorService from '../../services/doctorService'
import HTTP_statusCode from '../../enums/httpStatusCode'
import cloudinary from '../../config/cloudinary_config'
import { Express } from 'express'
import multer from 'multer';

class DoctorController {
    private doctorService: DoctorService

    constructor(doctorService: DoctorService) {
        this.doctorService = doctorService
    }

    register = async (req: Request, res: Response) => {
        const { email } = req.body
        // console.log(email);
        await this.doctorService.register(email)
        res.status(HTTP_statusCode.OK).send("OTP Sent to mail")
    }

    doctorLogin = async (req: Request, res: Response) => {
        try {

            const { email } = req.body
            // console.log("doctorLoginWorked", email);

            await this.doctorService.doctorLogin(email)
            res.status(HTTP_statusCode.OK).send("OTP Sent to mail")

        } catch (error: any) {
            // console.log("con",error);

            if (error.message === "Email not Registered") {
                res.status(HTTP_statusCode.NotFound).json({ message: "Email not Registered" });
            } else if (error.message === "Your Kyc Verification is Rejected") {
                res.status(HTTP_statusCode.NotFound).json({ message: "Your Kyc Verification is Rejected" });

            } else if (error.message === "Your Kyc Request is Under Review. Please Wait for Conformation Email") {
                res.status(HTTP_statusCode.NotFound).json({ message: "Your Kyc Request is Under Review. Please Wait for Conformation Email" });

            }
            else {
                console.log(error);

                res.status(HTTP_statusCode.InternalServerError).json({ message: "Something wrong please try again later" });
            };
        }


    }

    verifyOtp = async (req: Request, res: Response) => {
        console.log("Inside doctor's verify otp")

        try {
            const { enteredOtp } = req.body
            console.log(enteredOtp);


            const serviceResponse = await this.doctorService.otpVerification(
                enteredOtp
            );
            res.status(HTTP_statusCode.OK).json(serviceResponse);
        } catch (error: any) {
            if (error.message === "Incorrect OTP") {
                res
                    .status(HTTP_statusCode.Unauthorized)
                    .json({ message: "Incorrect OTP" });
            } else if (error.message === "OTP is expired") {
                res.status(HTTP_statusCode.Expired).json({ message: "OTP is expired" });
            } else {
                res
                    .status(HTTP_statusCode.InternalServerError)
                    .json({ message: "Something went wrong. Please try again later." });
            }
        }
    }

    verifyDoctorOtp = async (req: Request, res: Response) => {
        // console.log("Inside doctor's verify otp")

        try {
            const { enteredOtp } = req.body
            // console.log(enteredOtp);


            const serviceResponse = await this.doctorService.verifyDoctorOtp(
                enteredOtp
            );
            res.status(HTTP_statusCode.OK).json(serviceResponse);
        } catch (error: any) {
            if (error.message === "Incorrect OTP") {
                res
                    .status(HTTP_statusCode.Unauthorized)
                    .json({ message: "Incorrect OTP" });
            } else if (error.message === "OTP is expired") {
                res.status(HTTP_statusCode.Expired).json({ message: "OTP is expired" });
            } else {
                res
                    .status(HTTP_statusCode.InternalServerError)
                    .json({ message: "Something went wrong. Please try again later." });
            }
        }
    };


    resendOtp = async (req: Request, res: Response) => {
        try {
            await this.doctorService.resendOTP();
            res.status(HTTP_statusCode.OK).send("OTP sended");
        } catch (error: any) {

            if (error.message === "Email not send") {
                res
                    .status(HTTP_statusCode.InternalServerError)
                    .json({ message: "Email not send" });
            } else {
                res
                    .status(HTTP_statusCode.InternalServerError)
                    .json({ message: "Something wrong please try again later" });
            }
        }
    };

    doctorRegister = async (req: Request, res: Response) => {
        try {
            const doctorData: any = req.body
            const fileName = req.files as Express.Multer.File[]


            console.log("This is doctor data inside controller ", doctorData)
            // console.log(fileName);

            // console.log("doctorRegister Controller Worked")

            //testing cloudinary weather connected

            // cloudinary.api.ping((error, result) => {
            //   if (error) {
            //     console.error("Cloudinary ping failed:", error);
            //   } else {
            //     console.log("Cloudinary ping result:", result);
            //     // A successful ping typically returns an object with a status "ok".
            //   }
            // });


            let uploadToCloudinary = (buffer: Buffer) => {
                console.log("uploadToCloudinary");

                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: "doctor_profiles" }, // Cloudinary folder
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result?.secure_url); // Return uploaded image URL
                            }
                        }
                    );
                    uploadStream.end(buffer); // Send buffer data to Cloudinary
                });


            };
            const imgObject: any = {}

            for (const file of fileName!) {
                const upload: any = await uploadToCloudinary(file.buffer)

                imgObject[file.fieldname] = upload
                // console.log(imgObject)
                // console.log(`Uploaded file name :${file.fieldname} and url = `, result);

            }


            await this.doctorService.doctorKycRegister(doctorData, imgObject)
            // const doc =  await this.doctorService.register(userData);
            // const fileNames = req.body.fileNames ? JSON.parse(req.body.fileNames) : [];

        } catch (error: any) {
            console.log(error.message);
            return res.status(400).json({ error: error.message });

        }
    }

    getDepartments = async (req: Request, res: Response) => {
        const getData = await this.doctorService.getDepartments()
        res.status(HTTP_statusCode.OK).json(getData);

    }

    updateDoctor = async (req: Request, res: Response) => {
        try {
            const doctorData: any = req.body
            const fileName = req.files as Express.Multer.File[]
            // console.log(doctorData);
            // console.log(fileName);


            let uploadToCloudinary = (buffer: Buffer) => {
                console.log("uploadToCloudinary");

                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: "doctor_profiles" }, // Cloudinary folder
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result?.secure_url); // Return uploaded image URL
                            }
                        }
                    );
                    uploadStream.end(buffer); // Send buffer data to Cloudinary
                });



            };
            const imgObject: any = {}

            for (const file of fileName!) {
                const upload: any = await uploadToCloudinary(file.buffer)

                imgObject[file.fieldname] = upload
                console.log(imgObject)
                // console.log(`Uploaded file name :${file.fieldname} and url = `, result);

            }
            const docData = await this.doctorService.updateDoctorProfile(doctorData, imgObject)
            res.status(HTTP_statusCode.OK).json(docData)
        } catch (error: any) {
            return res.status(400).json({ error: error.message });

        }

    }
}

export default DoctorController