import { IAdmin } from '../models/admin/adminModel'
import { Model } from 'mongoose'
import { IDepartment } from '../models/admin/departmentModel'
import { IDoctor } from '../models/doctor/doctorModel'
import { IUserModel } from '../interfaces/user/userModelInterface'
import { IAdminWallet } from '../models/admin/adminWalletModel'
import IDoctorModel from '../interfaces/doctor/doctorModelInterface'
import { IAdminRepository } from '../interfaces/admin/IAdminRepository'
import { IAdminAuth, IDoctorData } from '../interfaces/admin/AdminInterface'
import { IWallet } from '../models/doctor/doctorWalletModel'
import { IBooking } from '../models/user/bookingModel'


class AdminReprository implements IAdminRepository {
    private adminModel: Model<IAdmin>
    private departmentModel: Model<IDepartment>
    private doctorModel: Model<IDoctor>
    private userModel: Model<IUserModel>
    private adminWalletModel: Model<IAdminWallet>
    private doctorWalletModel: Model<IWallet>
    private bookingModel: Model<IBooking>
    constructor(adminModel: Model<IAdmin>, departmentModel: Model<IDepartment>, doctorModel: Model<IDoctor>, userModel: Model<IUserModel>, adminWalletModel: Model<IAdminWallet>, doctorWalletModel: Model<IWallet>, bookingModel: Model<IBooking>) {


        this.adminModel = adminModel
        this.departmentModel = departmentModel
        this.doctorModel = doctorModel
        this.userModel = userModel
        this.adminWalletModel = adminWalletModel
        this.doctorWalletModel = doctorWalletModel
        this.bookingModel = bookingModel
    }

    getEmailAndPassword = async (email: string): Promise<IAdminAuth | null> => {
        const admin = await this.adminModel.findOne({ email });

        if (!admin) return null;

        return {
            _id: admin._id,
            email: admin.email,
            password: admin.password,
        };
    };


    addDepartments = async (dept: String) => {
        try {
            const data = await this.departmentModel.findOne({ departmentName: dept })
            if (data === null) {
                try {
                    const obj = { departmentName: dept };
                    await this.departmentModel.create(obj);
                    const allData = await this.departmentModel.find()
                    return allData
                } catch (error) {
                    throw error
                }
            }
        } catch (error) {
            throw error
        }


    };

    // Get departments with pagination
    getDepartments = async (page: number, limit: number) => {
        try {
            const skip = (page - 1) * limit;

            const [data, totalCount] = await Promise.all([
                this.departmentModel.find().sort({ _id: -1 }).skip(skip).limit(limit).lean(),
                this.departmentModel.countDocuments()
            ]);

            return {
                data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            };
        } catch (error) {
            throw error;
        }
    };


    updateListUnlist = async (departmentName: string) => {
        try {

            const department = await this.departmentModel.findOne({ departmentName });

            if (!department) {
                return [];
            }
            department.isListed = !department.isListed;
            const updatedDepartment = await department.save();
            return await this.departmentModel.find()

        } catch (error) {
            throw error
        }
    };


    getDoctors = async (page: number, limit: number) => {
        try {
            const skip = (page - 1) * limit;

            const query = {
                name: { $exists: true, $ne: "" },
                degree: { $exists: true, $ne: "" },
                profileImage: { $exists: true, $ne: "" },
                medicalLicenceNumber: { $exists: true, $ne: "" }
            };

            const [data, totalCount] = await Promise.all([
                this.doctorModel
                    .find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean<IDoctorModel[]>(),
                this.doctorModel.countDocuments(query)
            ]);

            return {
                data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            };
        } catch (error) {
            throw error;
        }
    };



    updateKycStatus = async (status: string, doctorId: string): Promise<IDoctorData | null> => {
        try {

            const updatedDoctor = await this.doctorModel.findByIdAndUpdate(
                doctorId,
                { $set: { kycStatus: status } },
                { new: true } // Return the updated document
            )

            return updatedDoctor as IDoctorData | null;

        } catch (error) {
            throw error;
        }
    };


    getPatients = async (page: number, limit: number) => {
        try {
            const skip = (page - 1) * limit;

            const [data, totalCount] = await Promise.all([
                this.userModel.find().skip(skip).limit(limit),
                this.userModel.countDocuments()
            ]);


            return {
                data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            };
        } catch (error) {
            throw error;
        }
    };


    updateuserIsBlocked = async (buttonName: string, id: string) => {
        try {
            const isUserBlocked = buttonName === "Block";

            // Update the document and return the updated user.
            const updatedUser = await this.userModel.findByIdAndUpdate(
                id,
                { isUserBlocked },
                { new: true }
            );
            return buttonName
        } catch (error) {
            console.error("Error updating user block status:", error);
            throw error;
        }
    };


    getWalletData = async (adminId: string, page: number, limit: number) => {
        try {
            const wallet = await this.adminWalletModel.findOne({ adminId });

            if (!wallet) {
                throw new Error('Wallet not found');
            }

            // Sort transactions by date in descending order (latest first)
            const sortedTransactions = wallet.transactions.sort(
                (a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()
            );

            const totalTransactions = sortedTransactions.length;
            const startIndex = (page - 1) * limit;
            const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + limit);

            return {
                _id: wallet._id,
                adminId: wallet.adminId,
                balance: wallet.balance,
                transactions: paginatedTransactions,
                totalTransactions,
                createdAt: wallet.createdAt,
                updatedAt: wallet.updatedAt,
            };
        } catch (error) {
            throw new Error('Failed to fetch wallet');
        }
    };


    findDashBoardData = async () => {
        try {

            const adminId = "admin";
            const result = await this.adminWalletModel.aggregate([
                { $match: { adminId } },
                { $unwind: '$transactions' },
                { $match: { 'transactions.transactionType': 'credit' } },
                {
                    $group: {
                        _id: null,
                        totalCredit: { $sum: '$transactions.amount' }
                    }
                }
            ]);

            const adminRevenue = result[0]?.totalCredit || 0;


            const revenueResult = await this.doctorWalletModel.aggregate([
                { $unwind: '$transactions' },
                { $match: { 'transactions.transactionType': 'credit' } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$transactions.amount' }
                    }
                }
            ]);

            const doctorRevenue = revenueResult[0]?.totalRevenue || 0;

            const totalRevenue = adminRevenue + doctorRevenue;

            const totalUsers = await this.userModel.countDocuments();

            const activeUsers = await this.userModel.countDocuments({ isUserBlocked: false });


            const totalDoctors = await this.doctorModel.countDocuments();


            const activeDoctors = await this.doctorModel.countDocuments({ kycStatus: 'Approved' });


            const totalBookings = await this.bookingModel.countDocuments();

            const data = await this.getMonthlyDashboardData()


            return {
                totalRevenue: totalRevenue,
                totalUsers: totalUsers,
                totalDoctors: totalDoctors,
                activeUsers: activeUsers,
                adminRevenue: adminRevenue,
                doctorRevenue: doctorRevenue,
                activeDoctors: activeDoctors,
                totalBookings: totalBookings,
                monthlyDashBoardData: data
            }
        } catch (error) {
            throw error
        }
    };

    getMonthlyDashboardData = async () => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const [adminRevenue, doctorRevenue, users, bookings] = await Promise.all([
            this.adminWalletModel.aggregate([
                { $unwind: "$transactions" },
                { $match: { "transactions.transactionType": "credit" } },
                {
                    $group: {
                        _id: {
                            month: { $month: "$transactions.date" },
                            year: { $year: "$transactions.date" },
                        },
                        revenue: { $sum: "$transactions.amount" },
                    },
                },
                { $project: { _id: 0, month: "$_id.month", year: "$_id.year", revenue: 1 } },
            ]),

            this.doctorWalletModel.aggregate([
                { $unwind: "$transactions" },
                { $match: { "transactions.transactionType": "credit" } },
                {
                    $group: {
                        _id: {
                            month: { $month: "$transactions.date" },
                            year: { $year: "$transactions.date" },
                        },
                        revenue: { $sum: "$transactions.amount" },
                    },
                },
                { $project: { _id: 0, month: "$_id.month", year: "$_id.year", revenue: 1 } },
            ]),

            this.userModel.aggregate([
                { $match: { createdAt: { $ne: null } } }, // <--- Add this line
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" },
                        },
                        users: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id.month",
                        year: "$_id.year",
                        users: 1,
                    },
                },
            ]),


            this.bookingModel.aggregate([
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" },
                        },
                        bookings: { $sum: 1 },
                    },
                },
                { $project: { _id: 0, month: "$_id.month", year: "$_id.year", bookings: 1 } },
            ]),
        ]);

        const resultMap = new Map<string, { month: string; revenue: number; users: number; bookings: number }>();

        const merge = (data: any[], key: "revenue" | "users" | "bookings") => {
            for (const item of data) {
                const id = `${item.year}-${item.month}`;
                const monthName = monthNames[item.month - 1];

                if (!resultMap.has(id)) {
                    resultMap.set(id, { month: monthName, revenue: 0, users: 0, bookings: 0 });
                }

                resultMap.get(id)![key] += item[key];
            }
        };

        merge(adminRevenue, "revenue");
        merge(doctorRevenue, "revenue");
        merge(users, "users");
        merge(bookings, "bookings");

        const sortedData = Array.from(resultMap.values()).sort(
            (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
        );

        return sortedData;
    };

    updateDepartment = async (departmentId: string, departmentName: string) => {
        try {
            const updatedDepartment = await this.departmentModel.findByIdAndUpdate(
                departmentId,
                { departmentName },
                { new: true } // returns the updated document
            );

            if (!updatedDepartment) {
                throw new Error("Department not found");
            }

            return {
                _id: updatedDepartment._id.toString(),
                departmentName: updatedDepartment.departmentName,
                isListed: updatedDepartment.isListed,
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Failed to update department");
            }
        }
    };


};



export default AdminReprository