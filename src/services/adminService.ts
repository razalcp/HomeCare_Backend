import IAdmin from '../models/admin/adminModel'
import { createToken, createRefreshToken } from '../config/jwt_config'
import AdminReprository from '../repositories/adminReprository'
import { sendDoctorEmail } from '../config/email_config'
import bcrypt from "bcrypt";
import IAdminService from '../interfaces/admin/IAdminService';
import { mapAdminToDto, mapPatientToDTO } from '../mappers/admin.mapper';
import { log } from 'node:console';
import { IDashboardData, IDepartmentResponse } from '../interfaces/admin/AdminInterface';
import { IAdminRepository } from '../interfaces/admin/IAdminRepository';

class AdminService implements IAdminService {
    private adminReprository: IAdminRepository
    constructor(adminReprository: IAdminRepository) {
        this.adminReprository = adminReprository
    }

    checkWetherAdmin = async (email: string, password: string) => {
        try {

            const data = await this.adminReprository.getEmailAndPassword(email)

            if (!data) throw new Error("Check Credentials");
            const comparePassword = await bcrypt.compare(password as string, data.password as string);
            if (!comparePassword) throw new Error("Wrong password");

            if (comparePassword) {
                const adminToken = createToken(data._id?.toString() || "", process.env.adminRole as string);

                const adminRefreshToken = createRefreshToken(data._id?.toString() || "", process.env.adminRole as string);

                const mappedAdmin = mapAdminToDto(data);

                return {
                    data: mappedAdmin,
                    adminToken,
                    adminRefreshToken,
                };

            }
        } catch (error) {
            throw error
        }

    }

    addDepartments = async (dept: string) => {
        const data = await this.adminReprository.addDepartments(dept)
        if (!data) throw new Error("Already Added");
        return data

    };

    getDepartments = async (page: number, limit: number) => {
        return await this.adminReprository.getDepartments(page, limit);
    };


    updateListUnlist = async (departmentName: string) => {
        const update = await this.adminReprository.updateListUnlist(departmentName)
        log
        if (!update) return [];
        return update
    };

    getDoctorData = async (page: number, limit: number) => {
        try {
            return await this.adminReprository.getDoctors(page, limit);
        } catch (error) {
            throw error;
        }
    };

    updateKycStatus = async (status: string, doctorId: string) => {
        try {
            const update = await this.adminReprository.updateKycStatus(status, doctorId)
            if (!update) {
                throw new Error("Doctor not found or update failed");
            }
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

        } catch (error) {
            throw error
        }
    };


    // getPatients = async (page: number, limit: number) => {
    //     try {
    //         const { data, totalCount, totalPages, currentPage } = await this.adminReprository.getPatients(page, limit);

    //         const safeData = data.map(mapPatientToDTO);

    //         return { data: safeData, totalCount, totalPages, currentPage };
    //     } catch (error) {
    //         throw error;
    //     }
    // };
    getPatients = async (page: number, limit: number, search: string) => {
        try {
            const { data, totalCount, totalPages, currentPage } =
                await this.adminReprository.getPatients(page, limit, search);

            const safeData = data.map(mapPatientToDTO);

            return { data: safeData, totalCount, totalPages, currentPage };
        } catch (error) {
            throw error;
        }
    };


    updateuserIsBlocked = async (buttonName: string, id: string) => {
        try {
            const update = await this.adminReprository.updateuserIsBlocked(buttonName, id)
            return
        } catch (error) {
            throw error
        }
    }

    getWalletData = async (adminId: string, page: number, limit: number) => {
        try {
            const getData = await this.adminReprository.getWalletData(adminId, page, limit);
            return getData;
        } catch (error) {
            throw error;
        }
    };

    findDashBoardData = async (): Promise<IDashboardData> => {
        try {
            const getData = await this.adminReprository.findDashBoardData()
            return getData;
        } catch (error) {
            throw error
        }
    };

    updateDepartment = async (departmentId: string, departmentName: string): Promise<IDepartmentResponse> => {
        try {
            const updateData = await this.adminReprository.updateDepartment(departmentId, departmentName)
            return {
                _id: updateData._id.toString(),
                departmentName: updateData.departmentName,
                isListed: updateData.isListed,
            };
        } catch (error) {
            throw error
        }
    };
}

export default AdminService