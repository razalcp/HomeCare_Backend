

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


        try {
            const { enteredOtp } = req.body



            const serviceResponse = await this.doctorService.verifyDoctorOtp(enteredOtp);
            res.cookie("doctorRefreshToken", serviceResponse.doctorRefreshToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.cookie("doctorAccessToken", serviceResponse.doctorToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 15 * 60 * 1000,
            });

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


            // console.log("This is doctor data inside controller ", doctorData)
            // console.log(fileName);
            const { email } = doctorData
            // console.log("destructered email", email)
            // console.log("doctorRegister Controller Worked for changing logic", doctorData)


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

            const isEmailRegistered = await this.doctorService.findRegisteredEmail(email)
            console.log("Inside isEmailRegistered", isEmailRegistered)

            if (isEmailRegistered?.email === email) {
                console.log("inside cloud upload condition");

                for (const file of fileName!) {
                    const upload: any = await uploadToCloudinary(file.buffer)

                    imgObject[file.fieldname] = upload
                    // console.log(imgObject)
                    // console.log(`Uploaded file name :${file.fieldname} and url = `, result);

                }

            }


            await this.doctorService.doctorKycRegister(doctorData, imgObject)
            // const doc =  await this.doctorService.register(userData);
            // const fileNames = req.body.fileNames ? JSON.parse(req.body.fileNames) : [];
            res.clearCookie("UserAccessToken", { httpOnly: true, secure: true, sameSite: 'none' });
            res.clearCookie("UserRefreshToken", { httpOnly: true, secure: true, sameSite: 'none' });
            res.status(200).json({ message: "Logged out successfully" });
        } catch (error: any) {
            console.log(error.message);
            return res.status(400).json({ error: error.message });

        }
    };

    getDepartments = async (req: Request, res: Response) => {
        const getData = await this.doctorService.getDepartments()
        res.status(HTTP_statusCode.OK).json(getData);

    };

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

    };

    logoutDoctor = async (req: Request, res: Response) => {
        try {
            res.clearCookie("doctorAccessToken", { httpOnly: true, secure: true, sameSite: 'none' });
            res.clearCookie("doctorRefreshToken", { httpOnly: true, secure: true, sameSite: 'none' });
            res.status(200).json({ message: "Logged out successfully" });
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
        }
    };



    addDoctorSlots = async (req: Request, res: Response) => {
        try {
            // console.log("Inside doctor controller add slots", req.body);
            const slotData = req.body
            const addSlot = await this.doctorService.addDoctorSlots(slotData)

            res.status(200).json({ message: "Slot added successfully!" });
        } catch (error: any) {
            // console.log("inside controller",error);

            if (error.message) {
                res
                    .status(HTTP_statusCode.BadRequest)
                    .json({ message: error.message });
            } else {
                res
                    .status(HTTP_statusCode.InternalServerError)
                    .json({ message: "Something wrong please try again later" });
            }

        }
    };

    getDoctorSlots = async (req: Request, res: Response) => {


        const { doctorId } = req.params;
        const getData = await this.doctorService.getDoctorSlots(doctorId)
        res.status(HTTP_statusCode.OK).json(getData);

    };

    getMyBookings = async (req: Request, res: Response) => {
        try {
            const doctorId = req.body.doctorId
            // console.log("Inside doctorcontrollers getUserBookings methord , this is userID :",doctorId);
            const getBookingData = await this.doctorService.getMyBookings(doctorId)
            res.status(HTTP_statusCode.OK).json(getBookingData)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
        }
    };

    getWalletData = async (req: Request, res: Response) => {
        try {
            const { doctorId } = req.params;
            const getData = await this.doctorService.getWalletData(doctorId)
            res.status(HTTP_statusCode.OK).json(getData)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
        }
    };

    bookedUsers = async (req: Request, res: Response) => {
        try {
            const doctorId = (req as any).user.user_id
            const Userdata = await this.doctorService.getBookedUsers(doctorId)
            res.status(HTTP_statusCode.OK).json(Userdata)

        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
        }

    };

    saveMessages = async (req: Request, res: Response) => {
        try {
            const messageData = req.body
            const saveData = await this.doctorService.saveMessages(messageData)
            res.status(HTTP_statusCode.OK).json(saveData)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
        }
    };
    deleteSlot = async (req: Request, res: Response) => {
        const { slotId } = req.params;
        const update = await this.doctorService.deleteSlot(slotId)
        res.status(200).json({ message: "Slot deleted" });
    };

    messages = async (req: Request, res: Response) => {
        try {
            const { receiverId, senderId } = req.query;
            // console.log("Recived both",receiverId,senderId);
            const getData = await this.doctorService.getMessages(receiverId as string, senderId as string)
            res.status(HTTP_statusCode.OK).json(getData)

        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
        }
    };



    savePrescription = async (req: Request, res: Response) => {
        try {
            const presData = req.body
            console.log("This is prescription", presData);
            const saveData = await this.doctorService.savePrescription(presData)
            res.status(HTTP_statusCode.OK).json(saveData)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });

        }

    }
    getPrescription = async (req: Request, res: Response) => {
        try {
            const { bookingId } = req.query

            const presData = await this.doctorService.getPrescription(bookingId as string)

            res.status(HTTP_statusCode.OK).json(presData)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });

        }
    };

    doctorDashBoard = async (req: Request, res: Response) => {
        try {
            const { doctorId } = req.query
            const dashData = await this.doctorService.doctorDashBoard(doctorId as string)

            res.status(HTTP_statusCode.OK).json(dashData)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });

        }
    }

}



export default DoctorController