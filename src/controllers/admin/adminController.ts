import { Request, Response } from 'express'
import AdminService from '../../services/adminService'
import HTTP_statusCode from '../../enums/httpStatusCode'
import IAdminService from '../../interfaces/admin/IAdminService';

class AdminController {
    private adminService: IAdminService;

    constructor(adminService: IAdminService) {
        this.adminService = adminService
    }

    adminLogin = async (req: Request, res: Response) => {
        try {
            const { values } = req.body
            const { loginId, password } = values

            const serviceResponse = await this.adminService.checkWetherAdmin(loginId, password)

            res.cookie("adminRefreshToken", serviceResponse?.adminRefreshToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.cookie("adminAccessToken", serviceResponse?.adminToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 15 * 60 * 1000,
            });


            res.status(HTTP_statusCode.OK).json({ data: serviceResponse });


        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === "Check Credentials") {
                    res.status(HTTP_statusCode.NotFound).json({ message: "Check Credentials" });
                } else if (error.message === "Wrong password") {
                    res.status(HTTP_statusCode.Unauthorized).json({ message: "Wrong password" });
                } else if (error.message === "User is blocked") {
                    res.status(HTTP_statusCode.NoAccess).json({ message: "User is blocked" });
                } else {
                    res.status(HTTP_statusCode.InternalServerError).json({
                        message: "Something went wrong, please reconnect internet and try again",
                    });
                }
            } else {
                res.status(HTTP_statusCode.InternalServerError).json({
                    message: "Unexpected error occurred",
                });
            }
        }
    }

    logoutAdmin = async (req: Request, res: Response) => {

        try {
            res.clearCookie("adminAccessToken", { httpOnly: true });
            res.clearCookie("adminRefreshToken", { httpOnly: true });
            res.status(200).json({ message: "Logged out successfully" });
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
        }
    }

    addDepartments = async (req: Request, res: Response) => {
        try {
            const { dept } = req.body

            const serviceResponse = await this.adminService.addDepartments(dept)

            res.status(HTTP_statusCode.OK).json({ data: serviceResponse })
        } catch (error) {

        }

    };



    getDepartments = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;

            const getData = await this.adminService.getDepartments(page, limit);

            res.status(HTTP_statusCode.OK).json(getData);
        } catch (error) {
            throw error;
        }
    };


    updateListUnlist = async (req: Request, res: Response) => {
        try {

            const { department } = req.body
            const updateData = await this.adminService.updateListUnlist(department)
            res.status(HTTP_statusCode.OK).json({ data: updateData })

        } catch (error) {
            throw error
        }
    }


    getDoctors = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 8;

            const result = await this.adminService.getDoctorData(page, limit);

            res.status(200).json(result);
        } catch (error) {
            console.error("Error in getDoctors Controller", error);
            res.status(500).json({ message: "Server Error" });
        }
    };

    updateKycStatus = async (req: Request, res: Response) => {

        try {
            const { status, doctorId } = req.body

            const updateData = await this.adminService.updateKycStatus(status, doctorId)
            res.status(HTTP_statusCode.OK).json({ data: updateData })

        } catch (error) {
            throw error
        }
    }


    getPatients = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 7;

            const result = await this.adminService.getPatients(page, limit);

            res.status(HTTP_statusCode.OK).json(result);
        } catch (error) {
            throw error;
        }
    };


    updateuserIsBlocked = async (req: Request, res: Response) => {
        try {
            const { buttonName, id } = req.body
            const updateData = await this.adminService.updateuserIsBlocked(buttonName, id)
            if (buttonName === 'Block') {
                res.clearCookie("UserAccessToken", { httpOnly: true, secure: true, sameSite: "strict" });
                res.clearCookie("UserRefreshToken", { httpOnly: true, secure: true, sameSite: "strict" });
            }
            res.status(HTTP_statusCode.OK).json({ data: updateData })
        } catch (error) {
            throw error
        }
    }


    getWalletData = async (req: Request, res: Response) => {
        try {
            const { adminId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;

            const walletData = await this.adminService.getWalletData(adminId, page, limit);

            res.status(HTTP_statusCode.OK).json(walletData);
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
        }
    };


    findDashBoardData = async (req: Request, res: Response) => {
        try {
            const getData = await this.adminService.findDashBoardData()
            res.status(HTTP_statusCode.OK).json(getData)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });

        }
    };

    updateDepartment = async (req: Request, res: Response) => {
        try {
            const { departmentId, departmentName } = req.body

            let updatedData = await this.adminService.updateDepartment(departmentId, departmentName)
            res.status(HTTP_statusCode.OK).json(updatedData)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });

        }
    };

}


export default AdminController;

