import { Request, Response } from 'express'
import HTTP_statusCode from '../../enums/httpStatusCode'
import cloudinary from '../../config/cloudinary_config'
import multer from 'multer';
import { IDoctorService } from '../../interfaces/doctor/IDoctorService'
import { IDoctorRequestData } from '../../interfaces/doctor/doctorControllerInterface';

class DoctorController {
    private doctorService: IDoctorService

    constructor(doctorService: IDoctorService) {
        this.doctorService = doctorService
    }

    register = async (req: Request, res: Response) => {
        const { email } = req.body

        await this.doctorService.register(email)
        res.status(HTTP_statusCode.OK).send("OTP Sent to mail")
    }

    doctorLogin = async (req: Request, res: Response) => {
        try {

            const { email } = req.body

            await this.doctorService.doctorLogin(email)
            res.status(HTTP_statusCode.OK).send("OTP Sent to mail")

        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === "Email not Registered") {
                    res.status(HTTP_statusCode.NotFound).json({ message: "Email not Registered" });
                } else if (error.message === "Your Kyc Verification is Rejected") {
                    res.status(HTTP_statusCode.NotFound).json({ message: "Your Kyc Verification is Rejected" });
                } else if (error.message === "Your Kyc Request is Under Review. Please Wait for Conformation Email") {
                    res.status(HTTP_statusCode.NotFound).json({ message: "Your Kyc Request is Under Review. Please Wait for Conformation Email" });
                } else {
                    res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong, please try again later" });
                }
            } else {
                // fallback in case it's not an instance of Error
                res.status(HTTP_statusCode.InternalServerError).json({ message: "Unknown error occurred" });
            }
        }



    }

    verifyOtp = async (req: Request, res: Response) => {
        try {
            const { enteredOtp } = req.body

            const serviceResponse = await this.doctorService.otpVerification(
                enteredOtp
            );
            res.status(HTTP_statusCode.OK).json(serviceResponse);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === "Incorrect OTP") {
                    res
                        .status(HTTP_statusCode.Unauthorized)
                        .json({ message: "Incorrect OTP" });
                } else if (error.message === "OTP is expired") {
                    res
                        .status(HTTP_statusCode.Expired)
                        .json({ message: "OTP is expired" });
                } else {
                    res
                        .status(HTTP_statusCode.InternalServerError)
                        .json({ message: "Something went wrong. Please try again later." });
                }
            } else {
                // Optional: fallback if error is not an Error instance
                res
                    .status(HTTP_statusCode.InternalServerError)
                    .json({ message: "An unknown error occurred." });
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
            const { doctorData } = serviceResponse;
            res.status(HTTP_statusCode.OK).json({ doctorData });
        } catch (error: unknown) {
            if (error instanceof Error) {
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
            } else {
                // fallback if error is not an instance of Error
                res
                    .status(HTTP_statusCode.InternalServerError)
                    .json({ message: "An unknown error occurred." });
            }
        }

    };


    resendOtp = async (req: Request, res: Response) => {
        try {
            await this.doctorService.resendOTP();
            res.status(HTTP_statusCode.OK).send("OTP sended");
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === "Email not send") {
                    res
                        .status(HTTP_statusCode.InternalServerError)
                        .json({ message: "Email not send" });
                } else {
                    res
                        .status(HTTP_statusCode.InternalServerError)
                        .json({ message: "Something wrong please try again later" });
                }
            } else {
                // fallback in case error is not a standard Error object
                res
                    .status(HTTP_statusCode.InternalServerError)
                    .json({ message: "Unexpected error occurred" });
            }
        }

    };

    doctorRegister = async (req: Request, res: Response) => {
        try {
            const doctorData: IDoctorRequestData = req.body

            const fileName = req.files as Express.Multer.File[]

            const { email } = doctorData

            let uploadToCloudinary = (buffer: Buffer) => {


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
            const imgObject: any = {};


            const isEmailRegistered = await this.doctorService.findRegisteredEmail(email)


            if (isEmailRegistered?.email === email) {

                for (const file of fileName!) {
                    const upload: any = await uploadToCloudinary(file.buffer)

                    imgObject[file.fieldname] = upload

                }

            }

            await this.doctorService.doctorKycRegister(doctorData, imgObject)
            // res.clearCookie("UserAccessToken", { httpOnly: true, secure: true, sameSite: 'none' });
            // res.clearCookie("UserRefreshToken", { httpOnly: true, secure: true, sameSite: 'none' });
            res.status(200).json({ message: "Logged out successfully" });
        } catch (error: any) {

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



            let uploadToCloudinary = (buffer: Buffer) => {


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

            const slotData = req.body
            const addSlot = await this.doctorService.addDoctorSlots(slotData)

            res.status(200).json({ message: "Slot added successfully!" });
        } catch (error: any) {


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

    getDoctorSlotsForBooking = async (req: Request, res: Response) => {

        const { doctorId } = req.params;
        const getData = await this.doctorService.getDoctorSlotsForBooking(doctorId)
        res.status(HTTP_statusCode.OK).json(getData);

    };

    getDoctorSlots = async (req: Request, res: Response) => {
        const { doctorId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const getData = await this.doctorService.getDoctorSlots(doctorId, page, limit);
        res.status(HTTP_statusCode.OK).json(getData);
    };


    getMyBookings = async (req: Request, res: Response) => {
        try {
            const { doctorId, page = 1, limit = 6 } = req.body;
            const result = await this.doctorService.getMyBookings(doctorId, Number(page), Number(limit));
            res.status(HTTP_statusCode.OK).json(result);
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
        }
    };


    getWalletData = async (req: Request, res: Response) => {
        try {
            const { doctorId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const walletData = await this.doctorService.getWalletData(doctorId, page, limit);

            res.status(HTTP_statusCode.OK).json(walletData);
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({
                message: "Something went wrong",
                error,
            });
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

            const getData = await this.doctorService.getMessages(receiverId as string, senderId as string)
            res.status(HTTP_statusCode.OK).json(getData)

        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
        }
    };



    savePrescription = async (req: Request, res: Response) => {
        try {
            const presData = req.body
            const saveData = await this.doctorService.savePrescription(presData)
            res.status(HTTP_statusCode.OK).json(saveData)
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
    };


}


export default DoctorController;

