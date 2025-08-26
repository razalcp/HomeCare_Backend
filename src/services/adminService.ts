import { createToken, createRefreshToken } from '../config/jwt_config'
import { sendDoctorEmail } from '../config/email_config'
import bcrypt from "bcrypt";
import IAdminService from '../interfaces/admin/IAdminService';
import { DashboardDTO, DepartmentResponseDTO, mapAdminToDto, mapPatientToDTO, MonthlyDashboardDTO, toDepartmentDTO, toDoctorDTO, toWalletDTO } from '../mappers/admin.mapper';
import { IDashboardData, IDepartmentResponse } from '../interfaces/admin/AdminInterface';
import { IAdminRepository } from '../interfaces/admin/IAdminRepository';
import { IDepartment } from '../models/admin/departmentModel';
import { WalletDTO } from '../dtos/admin.dto';

class AdminService implements IAdminService {
    private _adminReprository: IAdminRepository

    constructor(adminReprository: IAdminRepository) {
        this._adminReprository = adminReprository
    }

    checkWetherAdmin = async (email: string, password: string) => {
        try {
            const data = await this._adminReprository.getEmailAndPassword(email)
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

    };

    addDepartments = async (dept: string) => {
        const data = await this._adminReprository.addDepartments(dept);
        if (!data) throw new Error("Already Added");
        const mappedData = data.map(toDepartmentDTO);
        return mappedData as unknown as IDepartment[];
    };


    getDepartments = async (page: number, limit: number, search: string) => {

        const result = await this._adminReprository.getDepartments(page, limit, search);
        const mappedData = result.data.map(toDepartmentDTO);

        return {
            ...result,
            data: mappedData as unknown as IDepartment[],
        };
    };


    updateListUnlist = async (departmentName: string): Promise<IDepartment[]> => {
        const update = await this._adminReprository.updateListUnlist(departmentName);
        if (!update) return [];
        const mapped = update.map(toDepartmentDTO);
        return mapped;
    };


    // getDoctorData = async (page: number, limit: number) => {
    //     try {
    //         return await this._adminReprository.getDoctors(page, limit);
    //     } catch (error) {
    //         throw error;
    //     }
    // };

    getDoctorData = async (page: number, limit: number) => {
        try {
            const result = await this._adminReprository.getDoctors(page, limit);

            return {
                ...result,
                data: result.data.map(toDoctorDTO),
            };
        } catch (error) {
            throw error;
        }
    };


    updateKycStatus = async (status: string, doctorId: string) => {
        try {
            const update = await this._adminReprository.updateKycStatus(status, doctorId)
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



    getPatients = async (page: number, limit: number, search: string) => {
        try {
            const { data, totalCount, totalPages, currentPage } =
                await this._adminReprository.getPatients(page, limit, search);

            const safeData = data.map(mapPatientToDTO);

            return { data: safeData, totalCount, totalPages, currentPage };
        } catch (error) {
            throw error;
        }
    };


    updateuserIsBlocked = async (buttonName: string, id: string) => {
        try {
            const update = await this._adminReprository.updateuserIsBlocked(buttonName, id)
            return
        } catch (error) {
            throw error
        }
    }


    // getWalletData = async (
    //     adminId: string,
    //     page: number,
    //     limit: number,
    //     search: string = "",
    //     type?: string
    // ) => {
    //     try {
    //         const getData = await this._adminReprository.getWalletData(
    //             adminId,
    //             page,
    //             limit,
    //             search,
    //             type
    //         );
    //         return getData;
    //     } catch (error) {
    //         throw error;
    //     }
    // };

    getWalletData = async (
        adminId: string,
        page: number,
        limit: number,
        search: string = "",
        type?: string
    ): Promise<WalletDTO> => {
        try {
            const getData = await this._adminReprository.getWalletData(
                adminId,
                page,
                limit,
                search,
                type
            );
            return toWalletDTO(getData);
        } catch (error) {
            throw error;
        }
    };


    // findDashBoardData = async (): Promise<IDashboardData> => {
    //     try {
    //         const getData = await this._adminReprository.findDashBoardData()
    //         return getData;
    //     } catch (error) {
    //         throw error
    //     }
    // };

    findDashBoardData = async (): Promise<IDashboardData> => {
        try {
            const getData = await this._adminReprository.findDashBoardData();
            if (!getData) {
                throw new Error("Dashboard data not found");
            }

            const monthlyMapped = getData.monthlyDashBoardData.map(entry =>
                MonthlyDashboardDTO(entry)
            );

            const mappedData = DashboardDTO({
                ...getData,
                monthlyDashBoardData: monthlyMapped
            });

            return mappedData;
        } catch (error) {
            throw error;
        }
    };

    // updateDepartment = async (departmentId: string, departmentName: string): Promise<IDepartmentResponse> => {
    //     try {
    //         const updateData = await this._adminReprository.updateDepartment(departmentId, departmentName)
    //         return {
    //             _id: updateData._id.toString(),
    //             departmentName: updateData.departmentName,
    //             isListed: updateData.isListed,
    //         };
    //     } catch (error) {
    //         throw error
    //     }
    // };

    updateDepartment = async (
        departmentId: string,
        departmentName: string
    ): Promise<IDepartmentResponse> => {
        try {
            const updateData = await this._adminReprository.updateDepartment(departmentId, departmentName);
            return DepartmentResponseDTO(updateData);
        } catch (error) {
            throw error;
        }
    };
}

export default AdminService