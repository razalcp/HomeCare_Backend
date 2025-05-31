import IAdmin from '../models/admin/adminModel'
import { createToken, createRefreshToken } from '../config/jwt_config'
import AdminReprository from '../repositories/adminReprository'
import { sendDoctorEmail } from '../config/email_config'
import bcrypt from "bcrypt";

class AdminService {
    private adminReprository: AdminReprository
    constructor(adminReprository: AdminReprository) {
        this.adminReprository = adminReprository
    }

    checkWetherAdmin = async (email: String, password: String) => {
        try {

            const data = await this.adminReprository.getEmailAndPassword(email, password)
            // console.log("this is data ", data)
            if (!data) throw new Error("Check Credentials");
            const comparePassword = await bcrypt.compare(password as any, data.password as string);
            if (!comparePassword) throw new Error("Wrong password");

            console.log("comparePassword", comparePassword);


            if (comparePassword) {
                const adminToken = createToken(data._id?.toString() || "", process.env.adminRole as string);

                const adminRefreshToken = createRefreshToken(data._id?.toString() || "", process.env.adminRole as string);
                return { data, adminToken, adminRefreshToken }
            }
        } catch (error) {
            throw error
        }

    }

    addDepartments = async (dept: String) => {
        const data = await this.adminReprository.addDepartments(dept)

        if (!data) throw new Error("Already Added");
        return data


    };
    getDepartments = async () => {
        const getData = await this.adminReprository.getDepartments()
        return getData
    };
    updateListUnlist = async (departmentName: String) => {
        const update = await this.adminReprository.updateListUnlist(departmentName)
        return update
    };
    getDoctorData = async () => {
        try {
            const data = await this.adminReprository.getDoctors()
            return data
        } catch (error) {
            throw error
        }

    }
    updateKycStatus = async (status: String, doctorId: String) => {
        try {
            const update = await this.adminReprository.updateKycStatus(status, doctorId)
            console.log("inside servi", update);
            if (update?.kycStatus === "Approved") {
                // node mailer logic
                const isMailSended = await sendDoctorEmail(update?.email, update?.kycStatus, update?.name)

                if (!isMailSended) {
                    throw new Error("Email not Send")
                }

                return
            } else {
                if (update?.email && update?.kycStatus && update?.name) {
                    const isRejectedMailSended = await sendDoctorEmail(update.email, update.kycStatus, update.name);
                    if (!isRejectedMailSended) {
                        throw new Error("Email not Send")
                    }
                    return
                } else {
                    console.error("Missing required fields: email, kycStatus, or name.");
                }


            }

            return update
        } catch (error) {
            throw error
        }
    };

    getPatients = async () => {
        try {
            const getData = await this.adminReprository.getPatients()
            return getData
        } catch (error) {
            throw error
        }
    }
    updateuserIsBlocked = async (buttonName: string, id: string) => {
        try {
            const update = await this.adminReprository.updateuserIsBlocked(buttonName, id)
            return update
        } catch (error) {
            throw error
        }
    }

    getWalletData = async (adminId: string) => {
        try {
            const getData = await this.adminReprository.getWalletData(adminId)
            return getData;
        } catch (error) {
            return error
        }
    };

    findDashBoardData = async () => {
        try {
            const getData = await this.adminReprository.findDashBoardData()
            return getData;
        } catch (error) {
            return error
        }
    }
}

export default AdminService