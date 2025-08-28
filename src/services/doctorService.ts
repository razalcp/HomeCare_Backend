import IDoctorModel from "../interfaces/doctor/doctorModelInterface";
import IDoctorReprository from "../interfaces/doctor/IDoctorReprository";
import sendEmail from "../config/email_config";
import { createToken, createRefreshToken } from "../config/jwt_config";
import { IDoctorService } from "../interfaces/doctor/IDoctorService";
import { IDoctorImageUpload, IDoctorKycRegisterInput, IMessageFromDoctor, IPrescriptionRequest, SlotInput } from "../interfaces/doctor/doctorInterface";
import { IBookingListResponseDTO, IDoctorDashboardDTO } from "../dtos/doctor.dto";
import { mapAddDoctorSlotsDTO, mapBookedUsersDTO, mapBookingToDTO, mapDepartmentsDTO, mapDoctorDashboardDTO, mapDoctorEmailDTO, mapDoctorFullDTO, mapDoctorSlotsDTO, mapDoctorUpdateFullDTO, mapMessagesDTO, mapWalletDataDTO, messageMapper } from "../mappers/doctor.mapper";
import { IUpdateDoctorProfile } from "../interfaces/user/userInterface";

class DoctorService implements IDoctorService {

    private _doctorReprository: IDoctorReprository

    private _doctorEmail: string | null = null;
    private _OTP: string | null = null;
    private _expiryOTP_time: Date | null = null;

    constructor(doctorReprository: IDoctorReprository) {
        this._doctorReprository = doctorReprository
    }


    findRegisteredEmail = async (email: string): Promise<{ email?: string } | null> => {
        const doctor = await this._doctorReprository.findByEmail(email);
        if (!doctor) return null;
        return mapDoctorEmailDTO(doctor);
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
            console.log(this._expiryOTP_time)
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
    };


    otpVerification = async (enteredOtp: string) => {

        try {
            if (enteredOtp !== this._OTP) throw new Error("Incorrect OTP");

            const currentTime = new Date();
            if (currentTime > this._expiryOTP_time!) throw new Error("OTP expired");

            const doctorData = await this._doctorReprository.register(this._doctorEmail!);
            if (!doctorData) throw new Error("Email not found");
            // if (doctorData.isVerified) throw new Error("Doctor is not verified");

            const doctorToken = createToken(
                doctorData._id?.toString() || "",
                process.env.doctorRole as string
            );

            const doctorRefreshToken = createRefreshToken(
                doctorData._id?.toString() || "",
                process.env.doctorRole as string
            );

            return {
                doctorData: mapDoctorFullDTO(doctorData),
                doctorToken,
                doctorRefreshToken
            };
        } catch (error) {
            throw error
        }

    };



    verifyDoctorOtp = async (enteredOtp: string) => {

        try {
            if (enteredOtp !== this._OTP) {
                console.log("Wrong Otp");

                throw new Error("Incorrect OTP")
            }
            const currentTime = new Date();


            if (currentTime > this._expiryOTP_time!) {
                console.log("Otp expired");

                throw new Error("OTP expired");
            }
            const doctorData = await this._doctorReprository.findEmailForLogin(this._doctorEmail!);
            if (!doctorData) throw new Error("Email not found");

            // if (doctorData?.isVerified) throw new Error("Doctor is not verified")

            const doctorToken = createToken(doctorData._id?.toString() || "", process.env.doctorRole as string);

            const doctorRefreshToken = createRefreshToken(doctorData._id?.toString() || "", process.env.doctorRole as string);

            return {
                doctorData: mapDoctorFullDTO(doctorData),
                doctorToken,
                doctorRefreshToken
            };

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
            const isMailSended = await sendEmail(this._doctorEmail!, Generated_OTP);
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
            console.log(saveDoctorData?.kycStatus?.toString());

            return saveDoctorData?.kycStatus?.toString() ?? null;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unexpected error occurred");
            }
        }
    };


    getDepartments = async () => {
        const getDeptData = await this._doctorReprository.getDepartments();
        const mappedDepartments = mapDepartmentsDTO(getDeptData);
        return mappedDepartments;
    };


    updateDoctorProfile = async (doctorData: IUpdateDoctorProfile, imgObject: { profileImage: string }) => {
        try {
            const updateDoctorData = await this._doctorReprository.updateDoctor(doctorData, imgObject)

            const mappedUpdateDoctorData = mapDoctorUpdateFullDTO(updateDoctorData)
            return mappedUpdateDoctorData;
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
            const updateSlotData = await this._doctorReprository.addDoctorSlots(slotData);
            const mappedData = mapAddDoctorSlotsDTO(updateSlotData);
            return mappedData;

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("An unexpected error occurred");
        }
    };

    // getDoctorSlotsForBooking = async (doctorId: string) => {
    //     const getSlots = await this._doctorReprository.getDoctorSlotsForBooking(doctorId)
    //     console.log("slots for booking", getSlots);

    //     return getSlots
    // };



    getDoctorSlots = async (doctorId: string, page: number, limit: number) => {
        const slotData = await this._doctorReprository.getDoctorSlots(doctorId, page, limit);
        const mappedData = mapDoctorSlotsDTO(slotData);
        return mappedData;
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
            const mappedData = mapWalletDataDTO(walletData);
            return mappedData;
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
            const userData = await this._doctorReprository.getBookedUsers(doctorId);
            const mappedData = mapBookedUsersDTO(userData);
            return mappedData;
        } catch (error) {
            throw new Error("error in getting booked users " + error);
        }
    };

    saveMessages = async (messageData: IMessageFromDoctor) => {
        try {
            const saveData = await this._doctorReprository.saveMessages(messageData);
            return messageMapper(saveData);
        } catch (error) {
            throw new Error('Service error saving message: ' + error);
        }
    };

    // getMessages = async (receiverId: string, senderId: string) => {
    //     try {
    //         const messageData = await this._doctorReprository.findMessage(receiverId, senderId)
    //         console.log("This is messageData -------> ", messageData);

    //         return messageData
    //     } catch (error) {
    //         throw new Error('error in getting messages ' + error);
    //     }
    // };

    getMessages = async (receiverId: string, senderId: string) => {
        try {
            const messageData = await this._doctorReprository.findMessage(receiverId, senderId);
            return mapMessagesDTO(messageData);
        } catch (error) {
            throw new Error("error in getting messages " + error);
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



    // doctorDashBoard = async (doctorId: string) => {
    //     try {
    //         const dashData = await this._doctorReprository.doctorDashboard(doctorId)
    //         console.log("dashData ---------> ", dashData);

    //         return dashData
    //     } catch (error) {
    //         throw new Error('Doctor Dashboard data not found' + error);
    //     }
    // };


    doctorDashBoard = async (doctorId: string): Promise<IDoctorDashboardDTO> => {
        try {
            const dashData = await this._doctorReprository.doctorDashboard(doctorId);

            if (!dashData) {
                throw new Error("Doctor Dashboard data not found");
            }

            return mapDoctorDashboardDTO(dashData);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error("Doctor Dashboard data not found: " + error.message);

            }
            throw new Error("An Unknown error occurred while fetching doctor dashboard");
        }
    };

}

export default DoctorService;