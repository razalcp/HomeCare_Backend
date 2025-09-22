import { Request, Response } from 'express'
import HTTP_statusCode from '../../enums/httpStatusCode'
import cloudinary from '../../config/cloudinary_config'
import { IDoctorService } from '../../interfaces/doctor/IDoctorService'
import { IDoctorRequestData } from '../../interfaces/doctor/doctorControllerInterface';
import { DoctorImageObject, IUpdateDoctorProfile } from '../../interfaces/user/userInterface';
import { AuthenticatedRequest } from '../../interfaces/doctor/doctorInterface';
import { RESPONSE_MESSAGES } from '../../constants/messages';

class DoctorController {
    private _doctorService: IDoctorService

    constructor(doctorService: IDoctorService) {
        this._doctorService = doctorService
    }

    register = async (req: Request, res: Response) => {
        const { email } = req.body

        await this._doctorService.register(email)
        res.status(HTTP_statusCode.OK).send(RESPONSE_MESSAGES.DOCTOR.OTP_SENT_TO_MAIL)
    }

    doctorLogin = async (req: Request, res: Response) => {
        try {

            const { email } = req.body

            await this._doctorService.doctorLogin(email)
            res.status(HTTP_statusCode.OK).send(RESPONSE_MESSAGES.DOCTOR.OTP_SENT_TO_MAIL)

        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === RESPONSE_MESSAGES.DOCTOR.EMAIL_NOT_REGISTERED) {
                    res.status(HTTP_statusCode.NotFound).json({ message: RESPONSE_MESSAGES.DOCTOR.EMAIL_NOT_REGISTERED });
                } else if (error.message === RESPONSE_MESSAGES.DOCTOR.KYC_VERIFICATION_REJECTED) {
                    res.status(HTTP_statusCode.NotFound).json({ message: RESPONSE_MESSAGES.DOCTOR.KYC_VERIFICATION_REJECTED });
                } else if (error.message === RESPONSE_MESSAGES.DOCTOR.KYC_UNDER_REVIEW) {
                    res.status(HTTP_statusCode.NotFound).json({ message: RESPONSE_MESSAGES.DOCTOR.KYC_UNDER_REVIEW });
                } else {
                    res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.DOCTOR.SOMETHING_WENT_WRONG_LOGIN });
                }
            } else {
                // fallback in case it's not an instance of Error
                res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.DOCTOR.UNKNOWN_ERROR });
            }
        }



    }

    verifyOtp = async (req: Request, res: Response) => {
        try {
            const { enteredOtp } = req.body

            const serviceResponse = await this._doctorService.otpVerification(
                enteredOtp
            );
            res.status(HTTP_statusCode.OK).json(serviceResponse);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === RESPONSE_MESSAGES.DOCTOR.INCORRECT_OTP) {
                    res
                        .status(HTTP_statusCode.Unauthorized)
                        .json({ message: RESPONSE_MESSAGES.DOCTOR.INCORRECT_OTP });
                } else if (error.message === RESPONSE_MESSAGES.DOCTOR.DOCTOR_OTP_EXPIRED) {
                    res
                        .status(HTTP_statusCode.Expired)
                        .json({ message: RESPONSE_MESSAGES.DOCTOR.DOCTOR_OTP_EXPIRED });
                } else {
                    res
                        .status(HTTP_statusCode.InternalServerError)
                        .json({ message: RESPONSE_MESSAGES.DOCTOR.SOMETHING_WENT_WRONG_IN_OTP });
                }
            } else {
                // Optional: fallback if error is not an Error instance
                res
                    .status(HTTP_statusCode.InternalServerError)
                    .json({ message: RESPONSE_MESSAGES.DOCTOR.UNKNOWN_ERROR_IN_OTP });
            }
        }

    }

    verifyDoctorOtp = async (req: Request, res: Response) => {
        try {
            const { enteredOtp } = req.body

            const serviceResponse = await this._doctorService.verifyDoctorOtp(enteredOtp);
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
                if (error.message === RESPONSE_MESSAGES.DOCTOR.INCORRECT_OTP) {
                    res
                        .status(HTTP_statusCode.Unauthorized)
                        .json({ message: RESPONSE_MESSAGES.DOCTOR.INCORRECT_OTP });
                } else if (error.message === RESPONSE_MESSAGES.DOCTOR.DOCTOR_OTP_EXPIRED) {
                    res.status(HTTP_statusCode.Expired).json({ message: RESPONSE_MESSAGES.DOCTOR.DOCTOR_OTP_EXPIRED });
                } else {
                    res
                        .status(HTTP_statusCode.InternalServerError)
                        .json({ message: RESPONSE_MESSAGES.DOCTOR.SOMETHING_WENT_WRONG_IN_OTP });
                }
            } else {
                // fallback if error is not an instance of Error
                res
                    .status(HTTP_statusCode.InternalServerError)
                    .json({ message: RESPONSE_MESSAGES.DOCTOR.UNKNOWN_ERROR_IN_OTP });
            }
        }

    };


    resendOtp = async (req: Request, res: Response) => {
        try {
            await this._doctorService.resendOTP();
            res.status(HTTP_statusCode.OK).send(RESPONSE_MESSAGES.DOCTOR.DOC_OTP_SENT);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === RESPONSE_MESSAGES.DOCTOR.EMAIL_NOT_SENT) {
                    res
                        .status(HTTP_statusCode.InternalServerError)
                        .json({ message: RESPONSE_MESSAGES.DOCTOR.EMAIL_NOT_SENT });
                } else {
                    res
                        .status(HTTP_statusCode.InternalServerError)
                        .json({ message: RESPONSE_MESSAGES.DOCTOR.SOMETHING_WENT_WRONG_IN_VERIFYOTP });
                }
            } else {
                // fallback in case error is not a standard Error object
                res
                    .status(HTTP_statusCode.InternalServerError)
                    .json({ message: RESPONSE_MESSAGES.COMMON.UNEXPECTED_ERROR });
            }
        }

    };

    doctorRegister = async (req: Request, res: Response) => {
        try {
            const doctorData: IDoctorRequestData = req.body

            const fileName = req.files as Express.Multer.File[]

            const { email } = doctorData

            let uploadToCloudinary = (buffer: Buffer): Promise<string> => {


                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: "doctor_profiles" }, // Cloudinary folder
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result?.secure_url || ""); // Return uploaded image URL
                            }
                        }
                    );
                    uploadStream.end(buffer); // Send buffer data to Cloudinary
                });


            };

            const imgObject: DoctorImageObject = {};


            const isEmailRegistered = await this._doctorService.findRegisteredEmail(email)


            if (isEmailRegistered?.email === email) {

                for (const file of fileName!) {
                    const upload: string = await uploadToCloudinary(file.buffer)
                    imgObject[file.fieldname as keyof DoctorImageObject] = upload

                }

            }

            await this._doctorService.doctorKycRegister(doctorData, imgObject)
            res.status(200).json({ message: RESPONSE_MESSAGES.DOCTOR.LOGOUT_SUCCESS });
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: RESPONSE_MESSAGES.DOCTOR.UNEXPECTED_ERROR_DOCTOR_REGISTER });
        }

    };

    getDepartments = async (req: Request, res: Response) => {
        const getData = await this._doctorService.getDepartments()
        res.status(HTTP_statusCode.OK).json(getData);

    };

    updateDoctor = async (req: Request, res: Response) => {
        try {
            const doctorData: IUpdateDoctorProfile = Object.assign({}, req.body);

            const fileName = req.files as Express.Multer.File[]

            for (const file of fileName) {
                if (!file || !file.buffer || !file.buffer.length) {
                    throw new Error('Invalid image file');
                }

                // continue with Cloudinary upload
            }

            let uploadToCloudinary = (buffer: Buffer): Promise<string> => {

                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: "doctor_profiles" }, // Cloudinary folder
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result?.secure_url || ""); // Return uploaded image URL
                            }
                        }
                    );
                    uploadStream.end(buffer); // Send buffer data to Cloudinary
                });

            };
            const imgObject: Partial<DoctorImageObject> = {};

            for (const file of fileName!) {
                const upload: string = await uploadToCloudinary(file.buffer)
                imgObject[file.fieldname as keyof DoctorImageObject] = upload;

            }

            const docData = await this._doctorService.updateDoctorProfile(doctorData, imgObject)
            res.status(HTTP_statusCode.OK).json(docData)
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({ error: RESPONSE_MESSAGES.DOCTOR.UNEXPECTED_ERROR_DOCTOR_REGISTER });
        }


    };

    logoutDoctor = async (req: Request, res: Response) => {
        try {
            res.clearCookie("doctorAccessToken", { httpOnly: true, secure: true, sameSite: 'none' });
            res.clearCookie("doctorRefreshToken", { httpOnly: true, secure: true, sameSite: 'none' });
            res.status(200).json({ message: RESPONSE_MESSAGES.DOCTOR.LOGOUT_DOCTOR_SUCCESS });
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
        }
    };



    addDoctorSlots = async (req: Request, res: Response) => {
        try {

            const slotData = req.body
            const addSlot = await this._doctorService.addDoctorSlots(slotData)

            res.status(200).json({ message: RESPONSE_MESSAGES.DOCTOR.SLOT_ADDED_SUCCESS });
        } catch (error: unknown) {
            if (error instanceof Error && error.message) {
                res
                    .status(HTTP_statusCode.BadRequest)
                    .json({ message: error.message });
            } else {
                res
                    .status(HTTP_statusCode.InternalServerError)
                    .json({ message: RESPONSE_MESSAGES.DOCTOR.SOMETHING_WENT_WRONG_IN_ADD_SLOT });
            }
        }

    };

    // getDoctorSlotsForBooking = async (req: Request, res: Response) => {

    //     const { doctorId } = req.params;
    //     const getData = await this._doctorService.getDoctorSlotsForBooking(doctorId)
    //     res.status(HTTP_statusCode.OK).json(getData);

    // };

    getDoctorSlots = async (req: Request, res: Response) => {
        const { doctorId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const getData = await this._doctorService.getDoctorSlots(doctorId, page, limit);
        res.status(HTTP_statusCode.OK).json(getData);
    };


    getMyBookings = async (req: Request, res: Response) => {
        try {
            const { doctorId, page = 1, limit = 6 } = req.body;
            const result = await this._doctorService.getMyBookings(doctorId, Number(page), Number(limit));
            res.status(HTTP_statusCode.OK).json(result);
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
        }
    };


    getWalletData = async (req: Request, res: Response) => {
        try {
            const { doctorId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const walletData = await this._doctorService.getWalletData(doctorId, page, limit);

            res.status(HTTP_statusCode.OK).json(walletData);
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({
                message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG,
                error,
            });
        }
    };


    bookedUsers = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const doctorId = req.user.user_id
            const Userdata = await this._doctorService.getBookedUsers(doctorId)
            res.status(HTTP_statusCode.OK).json(Userdata)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
        }

    };

    saveMessages = async (req: Request, res: Response) => {
        try {
            const messageData = req.body
            const saveData = await this._doctorService.saveMessages(messageData)
            res.status(HTTP_statusCode.OK).json(saveData)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
        }
    };
    deleteSlot = async (req: Request, res: Response) => {
        const { slotId } = req.params;
        const update = await this._doctorService.deleteSlot(slotId)
        res.status(200).json({ message: RESPONSE_MESSAGES.DOCTOR.SLOT_DELETED });
    };

    messages = async (req: Request, res: Response) => {
        try {
            const { receiverId, senderId } = req.query;

            const getData = await this._doctorService.getMessages(receiverId as string, senderId as string)
            res.status(HTTP_statusCode.OK).json(getData)

        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
        }
    };



    savePrescription = async (req: Request, res: Response) => {
        try {
            const presData = req.body
            const saveData = await this._doctorService.savePrescription(presData)
            res.status(HTTP_statusCode.OK).json(saveData)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });

        }

    };

    doctorDashBoard = async (req: Request, res: Response) => {
        try {
            const { doctorId } = req.query
            const dashData = await this._doctorService.doctorDashBoard(doctorId as string)

            res.status(HTTP_statusCode.OK).json(dashData)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });

        }
    };


}


export default DoctorController;

