// import { IAdmin } from '../models/admin/adminModel'
// import { Model } from 'mongoose'
// import { IDepartment } from '../models/admin/departmentModel'
// import { IDoctor } from '../models/doctor/doctorModel'
// import { IUserModel } from '../interfaces/user/userModelInterface'
// import { IAdminWallet } from '../models/admin/adminWalletModel'
// import BaseRepository from './baseRepository'



// class AdminReprository {
//     private adminModel: Model<IAdmin>
//     private departmentModel: Model<IDepartment>
//     private doctorModel: Model<IDoctor>
//     private userModel: Model<IUserModel>
//     private adminWalletModel: Model<IAdminWallet>
//     private doctorWalletModel: any
//     private bookingModel: any
//     constructor(adminModel: Model<IAdmin>, departmentModel: Model<IDepartment>, doctorModel: Model<IDoctor>, bookingModel: any, userModel: Model<IUserModel>, adminWalletModel: Model<IAdminWallet>, doctorWalletModel: any) {
//         console.log("This is admin model", adminModel);
//         console.log("This is user model", userModel);



//         this.adminModel = adminModel
//         this.departmentModel = departmentModel
//         this.doctorModel = doctorModel
//         this.userModel = userModel
//         this.adminWalletModel = adminWalletModel
//         this.doctorWalletModel = doctorWalletModel
//         this.bookingModel = bookingModel
//     }

//     getEmailAndPassword = async (email: String, password: String) => {

//         return await this.adminModel.findOne({ email });


//     };

//     addDepartments = async (dept: String) => {
//         try {
//             // console.log(dept); 

//             const data = await this.departmentModel.findOne({ departmentName: dept })

//             if (data === null) {
//                 // console.log(this.departmentModel);
//                 try {
//                     const obj = { departmentName: dept };
//                     await this.departmentModel.create(obj);
//                     const allData = await this.departmentModel.find()
//                     return allData
//                 } catch (error) {
//                     throw error
//                 }
//             }
//         } catch (error) {
//             throw error
//         }


//     };




//     getDepartments = async () => {
//         try {
//             return await this.departmentModel.find()

//         } catch (error) {
//             throw error
//         }
//     };

//     updateListUnlist = async (departmentName: String) => {
//         try {

//             const department = await this.departmentModel.findOne({ departmentName });

//             if (!department) {

//                 return null;
//             }
//             department.isListed = !department.isListed;
//             const updatedDepartment = await department.save();
//             return await this.departmentModel.find()

//         } catch (error) {
//             throw error
//         }
//     };


//     getDoctors = async () => {
//         try {
//             return await this.doctorModel.find()
//         } catch (error) {
//             throw error
//         }
//     };

//     updateKycStatus = async (status: String, doctorId: String) => {
//         try {
//             console.log(status, doctorId);

//             // const validDoctorId = new mongoose.Types.ObjectId(doctorId);
//             const updatedDoctor = await this.doctorModel.findByIdAndUpdate(
//                 doctorId,
//                 { $set: { kycStatus: status } }, // Updating the kycStatus field
//                 { new: true } // Return the updated document
//             );
//             return updatedDoctor

//         } catch (error) {

//         }
//     };


//     getPatients = async () => {
//         try {
//             const getData = await this.userModel.find()
//             return getData
//         } catch (error) {
//             throw error
//         }
//     };

//     updateuserIsBlocked = async (buttonName: string, id: string) => {
//         try {
//             // console.log("Inside serviz ", buttonName, id);

//             const isUserBlocked = buttonName === "Block";

//             // Update the document and return the updated user.
//             const updatedUser = await this.userModel.findByIdAndUpdate(
//                 id,
//                 { isUserBlocked },
//                 { new: true }
//             );
//             // console.log(updatedUser);

//             return updatedUser;
//         } catch (error) {
//             console.error("Error updating user block status:", error);
//             throw error;
//         }
//     };

//     getWalletData = async (adminId: string) => {
//         try {
//             const wallet = await this.adminWalletModel.findOne({ adminId });
//             return wallet; // or throw if not found
//         } catch (error) {
//             console.error('Error fetching doctor wallet:', error);
//             throw new Error('Failed to fetch wallet');
//         }
//     };

//     findDashBoardData = async () => {
//         try {

//             const adminId = "admin";
//             const ge = this.adminWalletModel.find()
//             console.log(ge);


//             const result = await this.adminWalletModel.aggregate([
//                 { $match: { adminId } },
//                 { $unwind: '$transactions' },
//                 { $match: { 'transactions.transactionType': 'credit' } },
//                 {
//                     $group: {
//                         _id: null,
//                         totalCredit: { $sum: '$transactions.amount' }
//                     }
//                 }
//             ]);

//             const adminRevenue = result[0]?.totalCredit || 0;
//             console.log('Total Admin Revenue:', adminRevenue);

//             const revenueResult = await this.doctorWalletModel.aggregate([
//                 { $unwind: '$transactions' },
//                 { $match: { 'transactions.transactionType': 'credit' } },
//                 {
//                     $group: {
//                         _id: null,
//                         totalRevenue: { $sum: '$transactions.amount' }
//                     }
//                 }
//             ]);

//             const doctorRevenue = revenueResult[0]?.totalRevenue || 0;
//             console.log('Total Doctor Revenue:', doctorRevenue);
//             const totalRevenue = adminRevenue + doctorRevenue;

//             const totalUsers = await this.userModel.countDocuments();
//             console.log('Total Users:', totalUsers);

//             const activeUsers = await this.userModel.countDocuments({ isUserBlocked: false });
//             console.log('Active Users:', activeUsers);

//             const totalDoctors = await this.doctorModel.countDocuments();
//             console.log('Total Doctors:', totalDoctors);

//             const activeDoctors = await this.doctorModel.countDocuments({ kycStatus: 'Approved' });
//             console.log('Active Doctors:', activeDoctors);

//             const totalBookings = await this.bookingModel.countDocuments();
//             console.log('Total Bookings:', totalBookings);

//             return {
//                 totalRevenue: totalRevenue,
//                 totalUsers: totalUsers,
//                 totalDoctors: totalDoctors,
//                 activeUsers: activeUsers,
//                 adminRevenue: adminRevenue,
//                 doctorRevenue: doctorRevenue,
//                 activeDoctors: activeDoctors,
//                 totalBookings: totalBookings

//             }
//         } catch (error) {

//         }
//     }
// };



// export default AdminReprository


import { IAdmin } from '../models/admin/adminModel'
import { Model } from 'mongoose'
import { IDepartment } from '../models/admin/departmentModel'
import { IDoctor } from '../models/doctor/doctorModel'
import { IUserModel } from '../interfaces/user/userModelInterface'
import { IAdminWallet } from '../models/admin/adminWalletModel'



class AdminReprository {
    private adminModel: Model<IAdmin>
    private departmentModel: Model<IDepartment>
    private doctorModel: Model<IDoctor>
    private userModel: Model<IUserModel>
    private adminWalletModel: Model<IAdminWallet>
    private doctorWalletModel: any
    private bookingModel: any
    constructor(adminModel: Model<IAdmin>, departmentModel: Model<IDepartment>, doctorModel: Model<IDoctor>, userModel: Model<IUserModel>, adminWalletModel: Model<IAdminWallet>, doctorWalletModel: any, bookingModel: any) {


        this.adminModel = adminModel
        this.departmentModel = departmentModel
        this.doctorModel = doctorModel
        this.userModel = userModel
        this.adminWalletModel = adminWalletModel
        this.doctorWalletModel = doctorWalletModel
        this.bookingModel = bookingModel
    }

    getEmailAndPassword = async (email: String, password: String) => {

        return await this.adminModel.findOne({ email });


    };

    addDepartments = async (dept: String) => {
        try {
            // console.log(dept); 

            const data = await this.departmentModel.findOne({ departmentName: dept })

            if (data === null) {
                // console.log(this.departmentModel);
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




    getDepartments = async () => {
        try {
            return await this.departmentModel.find()

        } catch (error) {
            throw error
        }
    };

    updateListUnlist = async (departmentName: String) => {
        try {

            const department = await this.departmentModel.findOne({ departmentName });

            if (!department) {

                return null;
            }
            department.isListed = !department.isListed;
            const updatedDepartment = await department.save();
            return await this.departmentModel.find()

        } catch (error) {
            throw error
        }
    };


    getDoctors = async () => {
        try {
            return await this.doctorModel.find()
        } catch (error) {
            throw error
        }
    };

    updateKycStatus = async (status: String, doctorId: String) => {
        try {
            console.log(status, doctorId);

            // const validDoctorId = new mongoose.Types.ObjectId(doctorId);
            const updatedDoctor = await this.doctorModel.findByIdAndUpdate(
                doctorId,
                { $set: { kycStatus: status } }, // Updating the kycStatus field
                { new: true } // Return the updated document
            );
            return updatedDoctor

        } catch (error) {

        }
    };


    getPatients = async () => {
        try {
            const getData = await this.userModel.find()
            return getData
        } catch (error) {
            throw error
        }
    };

    updateuserIsBlocked = async (buttonName: string, id: string) => {
        try {
            // console.log("Inside serviz ", buttonName, id);

            const isUserBlocked = buttonName === "Block";

            // Update the document and return the updated user.
            const updatedUser = await this.userModel.findByIdAndUpdate(
                id,
                { isUserBlocked },
                { new: true }
            );
            // console.log(updatedUser);

            return updatedUser;
        } catch (error) {
            console.error("Error updating user block status:", error);
            throw error;
        }
    };

    getWalletData = async (adminId: string) => {
        try {
            const wallet = await this.adminWalletModel.findOne({ adminId });
            return wallet; // or throw if not found
        } catch (error) {
            console.error('Error fetching doctor wallet:', error);
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
            console.log('Total Admin Revenue:', adminRevenue);

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
            console.log('Total Doctor Revenue:', doctorRevenue);
            const totalRevenue = adminRevenue + doctorRevenue;
            console.log("Total Revenue :", totalRevenue);

            const totalUsers = await this.userModel.countDocuments();
            console.log('Total Users:', totalUsers);

            const activeUsers = await this.userModel.countDocuments({ isUserBlocked: false });
            console.log('Active Users:', activeUsers);

            const totalDoctors = await this.doctorModel.countDocuments();
            console.log('Total Doctors:', totalDoctors);

            const activeDoctors = await this.doctorModel.countDocuments({ kycStatus: 'Approved' });
            console.log('Active Doctors:', activeDoctors);

            const totalBookings = await this.bookingModel.countDocuments();
            console.log('Total Bookings:', totalBookings);
            const data = await this.getMonthlyDashboardData()
            console.log("data", data);

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
    }
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
    }


};



export default AdminReprository