import IDoctorModel from "../interfaces/doctor/doctorModelInterface";
import IDoctorReprository from "../interfaces/doctor/IDoctorReprository";
import sendEmail from "../config/email_config";
import { createToken, createRefreshToken } from "../config/jwt_config";
import { IDoctorService } from "../interfaces/doctor/IDoctorService";
import { IDoctorImageUpload, IDoctorKycRegisterInput, IMessageFromDoctor, IPrescriptionRequest, SlotInput } from "../interfaces/doctor/doctorInterface";
import { IBookingListResponseDTO } from "../dtos/doctor.dto";
import { mapBookingToDTO } from "../mappers/doctor.mapper";

class DoctorService implements IDoctorService {

    private _doctorReprository: IDoctorReprository

    private _doctorEmail: string | null = null;
    private _OTP: string | null = null;
    private _expiryOTP_time: Date | null = null;

    constructor(doctorReprository: IDoctorReprository) {
        this._doctorReprository = doctorReprository
    }

    findRegisteredEmail = async (email: string) => {
        return await this._doctorReprository.findByEmail(email)
    };

    register = async (email: string) => {
        try {
            const alreadyExistingDoctor = await this._doctorReprository.findByEmail(email)

            this._doctorEmail = email

            const generated_Otp = Math.floor(1000 + Math.random() * 9000).toString()
            this._OTP = generated_Otp
            const isMailSended = await sendEmail(email, generated_Otp)
            if (!isMailSended) {
                throw new Error("Email not Send")
            }

            const OTP_createdTime = new Date();
             this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 2 * 60 * 1000);
            console.log( this._expiryOTP_time)
            return;
        } catch (error) {
            throw error
        }


    };

    doctorLogin = async (email: string) => {

        try {
            const alreadyApprovedDoctor = await this._doctorReprository.findEmailForLogin(email)

             this._doctorEmail = email


            if (alreadyApprovedDoctor?.kycStatus === 'Rejected') {
                throw new Error("Your Kyc Verification is Rejected")
            }

            else if (alreadyApprovedDoctor?.kycStatus === 'Approved') {

                const generated_Otp = Math.floor(1000 + Math.random() * 9000).toString()
                 this._OTP = generated_Otp
                const isMailSended = await sendEmail(email, generated_Otp)
                if (!isMailSended) {
                    throw new Error("Email not Send")
                }
            }

            else if (alreadyApprovedDoctor?.kycStatus === 'Pending') {
                throw new Error("Your Kyc Request is Under Review. Please Wait for Conformation Email")
            } else {
                throw new Error('Email not Registered')

            }



            const OTP_createdTime = new Date();
             this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 2 * 60 * 1000);

            return;
        } catch (error) {
            throw error
        }
    }

    otpVerification = async (enteredOtp: string) => {
        try {
            if (enteredOtp !==  this._OTP) {

                throw new Error("Incorrect OTP")
            }
            const currentTime = new Date();

            if (currentTime >  this._expiryOTP_time!) {
                console.log("Otp expired");

                throw new Error("OTP expired");
            }
            const doctorData = await this._doctorReprository.register( this._doctorEmail!);
            if (!doctorData) throw new Error("Email not found");


            if (doctorData?.isBlocked) throw new Error("Doctor is Blocked")

            const doctorToken = createToken(doctorData._id?.toString() || "", process.env.doctorRole as string);

            const doctorRefreshToken = createRefreshToken(doctorData._id?.toString() || "", process.env.doctorRole as string);

            return { doctorData, doctorToken, doctorRefreshToken }

        } catch (error) {
            throw error
        }
    }

    verifyDoctorOtp = async (enteredOtp: string) => {


        try {
            if (enteredOtp !==  this._OTP) {
                console.log("Wrong Otp");

                throw new Error("Incorrect OTP")
            }
            const currentTime = new Date();


            if (currentTime >  this._expiryOTP_time!) {
                console.log("Otp expired");

                throw new Error("OTP expired");
            }
            const doctorData = await this._doctorReprository.findEmailForLogin( this._doctorEmail!);
            if (!doctorData) throw new Error("Email not found");


            if (doctorData?.isBlocked) throw new Error("Doctor is Blocked")

            const doctorToken = createToken(doctorData._id?.toString() || "", process.env.doctorRole as string);

            const doctorRefreshToken = createRefreshToken(doctorData._id?.toString() || "", process.env.doctorRole as string);


            return { doctorData, doctorToken, doctorRefreshToken }

        } catch (error) {


            throw error
        }
    };

    resendOTP = async () => {
        try {
            const Generated_OTP: string = Math.floor(
                1000 + Math.random() * 9000
            ).toString();
             this._OTP = Generated_OTP;
            console.log(`Re-generated OTP is : ${Generated_OTP}`);
            const isMailSended = await sendEmail( this._doctorEmail!, Generated_OTP);
            if (!isMailSended) {
                throw new Error("Email not send");
            }
            const OTP_createdTime = new Date();
             this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 2 * 60 * 1000);
        } catch (error) {
            throw error;
        }
    };

    doctorKycRegister = async (doctorData: IDoctorKycRegisterInput, imgObject: IDoctorImageUpload) => {
        try {
            const saveDoctorData = await this._doctorReprository.doctorRepoKycRegister(doctorData, imgObject)
            return saveDoctorData?.kycStatus?.toString() ?? null;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unexpected error occurred");
            }
        }
    }

    getDepartments = async () => {
        const getDeptData = await this._doctorReprository.getDepartments()
        return getDeptData
    }

    updateDoctorProfile = async (doctorData: IDoctorModel, imgObject: { profileImage: string }) => {
        try {
            const updateDoctorData = await this._doctorReprository.updateDoctor(doctorData, imgObject)
            return updateDoctorData;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unknown error occurred during profile update.");
            }
        }
    };

    addDoctorSlots = async (slotData: SlotInput) => {

        try {
            const updateSlotData = await this._doctorReprository.addDoctorSlots(slotData)

            return updateSlotData

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("An unexpected error occurred");
        }

    };

    getDoctorSlotsForBooking = async (doctorId: string) => {
        const getSlots = await this._doctorReprository.getDoctorSlotsForBooking(doctorId)
        return getSlots
    };

    getDoctorSlots = async (doctorId: string, page: number, limit: number) => {
        return await this._doctorReprository.getDoctorSlots(doctorId, page, limit);
    };



    getMyBookings = async (doctorId: string, page: number, limit: number): Promise<IBookingListResponseDTO> => {
        const result = await this._doctorReprository.getMyBookings(doctorId, page, limit);
            
        return {
            bookings: result.bookings.map(mapBookingToDTO),
            totalPages: result.totalPages,
        };

    };


    getWalletData = async (doctorId: string, page: number, limit: number) => {
        try {
            const walletData = await this._doctorReprository.getWalletData(doctorId, page, limit);
            return walletData;
        } catch (error) {
            throw new Error('Service error: ' + error);
        }
    };

    deleteSlot = async (slotId: string): Promise<string> => {
        try {
            const update = await this._doctorReprository.deleteSlot(slotId)
            return update
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while deleting the slot.");
        }

    };

    getBookedUsers = async (doctorId: string) => {
        try {
            const userData = await this._doctorReprository.getBookedUsers(doctorId)
            return userData
        } catch (error) {
            throw new Error('error in getting booked users ' + error);
        }
    };

    saveMessages = async (messageData: IMessageFromDoctor) => {
        try {
            const saveData = await this._doctorReprository.saveMessages(messageData)
            return saveData
        } catch (error) {
            throw new Error('Service error saving message: ' + error);
        }
    };

    getMessages = async (receiverId: string, senderId: string) => {
        try {
            const messageData = await this._doctorReprository.findMessage(receiverId, senderId)
            return messageData
        } catch (error) {
            throw new Error('error in getting messages ' + error);
        }
    };


    savePrescription = async (presData: IPrescriptionRequest) => {
        try {
            const saveData = await this._doctorReprository.savePrescription(presData)
            return saveData
        } catch (error) {
            throw new Error('error in saving prescription: ' + error);
        }
    };



    doctorDashBoard = async (doctorId: string) => {
        try {
            const dashData = await this._doctorReprository.doctorDashboard(doctorId)
            return dashData
        } catch (error) {
            throw new Error('Doctor Dashboard data not found' + error);
        }
    };


}

export default DoctorService;