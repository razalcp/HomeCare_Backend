import { Request, Response } from 'express'
import AdminService from '../../services/adminService'
import HTTP_statusCode from '../../enums/httpStatusCode'


class AdminController {
    private adminService: AdminService;

    constructor(adminService: AdminService) {
        this.adminService = adminService
    }

    adminLogin = async (req: Request, res: Response) => {
        try {
            const { values } = req.body
            const { loginId, password } = values

            // console.log("email --> ", loginId)



            const serviceResponse = await this.adminService.checkWetherAdmin(loginId, password)


            res.cookie("adminRefreshToken", serviceResponse?.adminRefreshToken, {
                httpOnly: true,
                // sameSite: 'none',
                // secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.cookie("adminAccessToken", serviceResponse?.adminToken, {
                httpOnly: true,
                // sameSite: 'none',
                // secure:false,
                maxAge: 15 * 60 * 1000,
            });
            // console.log("this is ", serviceResponse);

            res.status(HTTP_statusCode.OK).json({ data: serviceResponse });


        } catch (error: any) {
            if (error.message === "Check Credentials") {
                res.status(HTTP_statusCode.NotFound).json({ message: "Check Credentials" });
            } else if (error.message === "Wrong password") {
                res.status(HTTP_statusCode.Unauthorized).json({ message: "Wrong password" });
            } else if (error.message === "User is blocked") {
                res.status(HTTP_statusCode.NoAccess).json({ message: "User is blocked" });
            } else {
                res.status(HTTP_statusCode.InternalServerError).json({ message: "Something wrong please re-connect internet and try again" });
            };
        };
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
            const getData = await this.adminService.getDepartments()


            res.status(HTTP_statusCode.OK).json({ data: getData })
        } catch (error) {
            throw error
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
            const getDocData = await this.adminService.getDoctorData()

            res.status(HTTP_statusCode.OK).json(getDocData)

        } catch (error) {
            throw error
        }
    }
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
            const getData = await this.adminService.getPatients()
            res.status(HTTP_statusCode.OK).json(getData);

        } catch (error) {
            throw error
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


            const getData = await this.adminService.getWalletData(adminId)
            res.status(HTTP_statusCode.OK).json(getData)
        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
        }
    }

}


export default AdminController;