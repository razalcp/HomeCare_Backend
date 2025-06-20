import IDoctorModel from "../interfaces/doctor/doctorModelInterface";
import IDoctorReprository from "../interfaces/doctor/IDoctorReprository";
import sendEmail from "../config/email_config";
import { createToken, createRefreshToken } from "../config/jwt_config";
import { IDoctorService } from "../interfaces/doctor/IDoctorService";

class DoctorService implements IDoctorService {
    private doctorReprository: IDoctorReprository

    private doctorEmail: string | null = null;
    private OTP: string | null = null;
    private expiryOTP_time: Date | null = null;

    constructor(doctorReprository: IDoctorReprository) {
        this.doctorReprository = doctorReprository
    }

    findRegisteredEmail = async (email: any) => {
        return await this.doctorReprository.findByEmail(email)
    }

    register = async (email: string) => {
        try {
            const alreadyExistingDoctor = await this.doctorReprository.findByEmail(email)

            this.doctorEmail = email

            const generated_Otp = Math.floor(1000 + Math.random() * 9000).toString()
            this.OTP = generated_Otp
            const isMailSended = await sendEmail(email, generated_Otp)
            if (!isMailSended) {
                throw new Error("Email not Send")
            }


            const OTP_createdTime = new Date();
            this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 2 * 60 * 1000);
            console.log(this.expiryOTP_time)
            return;
        } catch (error) {
            throw error
        }


    }
    doctorLogin = async (email: string) => {
        try {
            const alreadyApprovedDoctor = await this.doctorReprository.findEmailForLogin(email)

            this.doctorEmail = email


            if (alreadyApprovedDoctor?.kycStatus === 'Rejected') {
                throw new Error("Your Kyc Verification is Rejected")
            }

            else if (alreadyApprovedDoctor?.kycStatus === 'Approved') {

                const generated_Otp = Math.floor(1000 + Math.random() * 9000).toString()
                this.OTP = generated_Otp
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
            this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 2 * 60 * 1000);

            return;
        } catch (error) {
            throw error
        }
    }

    otpVerification = async (enteredOtp: string) => {


        try {
            if (enteredOtp !== this.OTP) {

                throw new Error("Incorrect OTP")
            }
            const currentTime = new Date();

            if (currentTime > this.expiryOTP_time!) {
                console.log("Otp expired");

                throw new Error("OTP expired");
            }
            const doctorData = await this.doctorReprository.register(this.doctorEmail!);
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
            if (enteredOtp !== this.OTP) {
                console.log("Wrong Otp");

                throw new Error("Incorrect OTP")
            }
            const currentTime = new Date();


            if (currentTime > this.expiryOTP_time!) {
                console.log("Otp expired");

                throw new Error("OTP expired");
            }
            const doctorData = await this.doctorReprository.findEmailForLogin(this.doctorEmail!);
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
            this.OTP = Generated_OTP;
            console.log(`Re-generated OTP is : ${Generated_OTP}`);
            const isMailSended = await sendEmail(this.doctorEmail!, Generated_OTP);
            if (!isMailSended) {
                throw new Error("Email not send");
            }
            const OTP_createdTime = new Date();
            this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 2 * 60 * 1000);
        } catch (error) {
            throw error;
        }
    };

    doctorKycRegister = async (doctorData: any, imgObject: any) => {
        try {


            const saveDoctorData = await this.doctorReprository.doctorRepoKycRegister(doctorData, imgObject)

            return saveDoctorData
        } catch (error: any) {

            throw new Error(error.message)
        }
    }
    getDepartments = async () => {
        const getDeptData = await this.doctorReprository.getDepartments()
        return getDeptData
    }

    updateDoctorProfile = async (doctorData: any, imgObject: any) => {
        try {
            const updateDoctorData = await this.doctorReprository.updateDoctor(doctorData, imgObject)
            return updateDoctorData;
        } catch (error: any) {

            throw new Error(error.message)
        }
    }
    addDoctorSlots = async (slotData: any) => {
        try {
            const updateSlotData = await this.doctorReprository.addDoctorSlots(slotData)

            return updateSlotData

        } catch (error: any) {
            throw error
        }

    };

    getDoctorSlotsForBooking = async (doctorId: string) => {
        const getSlots = await this.doctorReprository.getDoctorSlotsForBooking(doctorId)
        return getSlots
    };

    getDoctorSlots = async (doctorId: string, page: number, limit: number) => {
        return await this.doctorReprository.getDoctorSlots(doctorId, page, limit);
    };



    getMyBookings = async (doctorId: string, page: number, limit: number) => {
        return await this.doctorReprository.getMyBookings(doctorId, page, limit);
    };

    getWalletData = async (doctorId: string, page: number, limit: number) => {
        try {
            const walletData = await this.doctorReprository.getWalletData(doctorId, page, limit);
            return walletData;
        } catch (error) {
            throw new Error('Service error: ' + error);
        }
    };

    deleteSlot = async (slotId: string) => {
        try {
            const update = await this.doctorReprository.deleteSlot(slotId)
            return update
        } catch (error) {
            return error
        }

    };
    getBookedUsers = async (doctorId: string) => {
        try {
            const userData = await this.doctorReprository.getBookedUser(doctorId)
            return userData
        } catch (error) {
            return error
        }
    };

    saveMessages = async (messageData: any) => {
        try {

            const saveData = await this.doctorReprository.saveMessages(messageData)
            return saveData
        } catch (error) {
            return error
        }
    };

    getMessages = async (receiverId: string, senderId: string) => {
        try {
            const messageData = await this.doctorReprository.findMessage(receiverId, senderId)

            return messageData
        } catch (error) {
            return error
        }
    }


    savePrescription = async (presData: any) => {
        try {
            const saveData = await this.doctorReprository.savePrescription(presData)
            return saveData
        } catch (error) {
            return error
        }
    }
    getPrescription = async (bookingId: string) => {
        try {
            const prescriptionData = await this.doctorReprository.getPrescription(bookingId)
            return prescriptionData
        } catch (error) {
            return error
        }
    }
    doctorDashBoard = async (doctorId: string) => {
        try {
            const dashData = await this.doctorReprository.doctorDashboard(doctorId)
            return dashData
        } catch (error) {
            return error
        }
    };

    updateDepartment = async (departmentId: string, departmentName: string) => {
        try {
            const updateData = await this.doctorReprository.updateDepartment(departmentId, departmentName)
            return updateData
        } catch (error) {
            return error
        }
    }

}

export default DoctorService