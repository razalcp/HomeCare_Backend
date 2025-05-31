
import IDoctorModel from "../interfaces/doctor/doctorModelInterface"
import IDoctorReprository from "../interfaces/doctor/IDoctorReprository"
import mongoose, { Model } from 'mongoose'
import { IDepartment } from "../models/admin/departmentModel"
import { ISlot } from "../models/doctor/slotModel"
import { IBooking } from "../models/user/bookingModel"
import { IWallet } from "../models/doctor/doctorWalletModel"
import BaseRepository from "./baseRepository"
import { IUserModel } from "../interfaces/user/userModelInterface"
import { log } from "console"


class DoctorReprository extends BaseRepository<any> implements IDoctorReprository {
    private doctorModel: Model<IDoctorModel>
    private departmentModel: Model<IDepartment>
    private slotModel: Model<ISlot>
    private bookingModel = Model<IBooking>
    private doctorWalletModel = Model<IWallet>
    private messageModel = Model as any
    private conversationModel = Model as any
    private prescriptionModel = Model as any
    private userModel: Model<IUserModel>

    constructor(doctorModel: Model<IDoctorModel>, departmentModel: Model<IDepartment>, slotModel: Model<ISlot>, bookingModel: Model<IBooking>, doctorWalletModel: Model<IWallet>, messageModel: any, conversationModel: any, prescriptionModel: any, userModel: Model<IUserModel>) {
        super(doctorModel)
        this.doctorModel = doctorModel
        this.departmentModel = departmentModel
        this.slotModel = slotModel
        this.bookingModel = bookingModel
        this.doctorWalletModel = doctorWalletModel
        this.messageModel = messageModel
        this.conversationModel = conversationModel
        this.prescriptionModel = prescriptionModel
        this.userModel = userModel

    }

    findByEmail = async (email: string): Promise<IDoctorModel | null> => {
        // console.log("Inside Doctor Reprository ", email);
        try {
            return await this.doctorModel.findOne({ email })
        } catch (error) {
            throw error
        }
    }

    findEmailForLogin = async (email: string): Promise<IDoctorModel | null> => {

        try {
            const doct = await this.doctorModel.findOne({ email })


            return doct
        } catch (error) {
            throw error
        }
    }

    doctorRepoKycRegister = async (doctorData: any, imgObject: any) => {





        const existingUser = await this.doctorModel.findOne({ email: doctorData.email })

        if (existingUser) {


            const updatedUser = await this.doctorModel.findOneAndUpdate(
                { email: doctorData.email },
                { $set: { ...doctorData, ...imgObject } },
                { new: true }
            )
            return updatedUser
        } else {
            throw new Error("Email not registered")
        }

        // const mergedObj = { ...doctorData, ...imgObject }

        // return await this.doctorModel.create(mergedObj);

    };

    updateDoctor = async (doctorData: any, imgObject: any) => {


        // console.log("repo doctorData ", doctorData);
        // console.log("repo imgObject ", imgObject);

        const existingUser = await this.doctorModel.findOne({ email: doctorData.email })

        if (existingUser) {
            // console.log("Inside existingUser");

            const updatedUser = await this.doctorModel.findOneAndUpdate(
                { email: doctorData.email },
                { $set: { ...doctorData, ...imgObject } },
                { new: true }
            )
            return updatedUser
        } else {
            throw new Error("Email not registered")
        }

        // const mergedObj = { ...doctorData, ...imgObject }

        // return await this.doctorModel.create(mergedObj);

    };

    register = async (regEmail: string | null) => {
        console.log("Inside regi ", regEmail);

        const obj = { email: regEmail }

        try {
            const alreadyExistingUser = await this.doctorModel.findOne({ email: regEmail })
            if (!alreadyExistingUser) {
                return await this.doctorModel.create(obj)
            }
            return alreadyExistingUser
        } catch (error) {
            throw error
        }

    };

    getDepartments = async () => {
        const data = await this.departmentModel.find(
            { isListed: true }, // Filter: isListed should be true
            { _id: 0, departmentName: 1 } // Projection: Only return departmentName, exclude _id
        );
        // console.log("This is departments " , data);
        return data

    };


    addDoctorSlots = async (slotData: ISlot | ISlot[]) => {

        try {
            if (Array.isArray(slotData)) {
                // Handling array case

                for (const slot of slotData) {
                    const existingSlot = await this.slotModel.findOne({
                        doctorId: slot.doctorId,
                        date: slot.date,
                        startTime: slot.startTime,
                        endTime: slot.endTime
                    });

                    if (existingSlot) {
                        throw new Error(`Slot already added for this date and time`);
                    }
                }

                // If no duplicate, insert all slots
                await this.slotModel.insertMany(slotData);
            } else {
                // Handling object case
                const existingSlot = await this.slotModel.findOne({
                    doctorId: slotData.doctorId,
                    date: slotData.date,
                    startTime: slotData.startTime,
                    endTime: slotData.endTime
                });

                if (existingSlot) {
                    throw new Error(`Slot already added for ${slotData.date} from ${slotData.startTime} to ${slotData.endTime}`);
                }

                // Insert new slot
                const newSlot = new this.slotModel(slotData);
                await newSlot.save();
            }

            return { success: true, message: "Slot(s) added successfully" };
        } catch (error: any) {
            console.log("error.message", error.message);

            throw new Error(error.message)
        }
    };

    getDoctorSlots = async (doctorId: string) => {
        return await this.slotModel.find({ doctorId });
    };

    getMyBookings = async (doctorId: string) => {
        try {
            // console.log("Inside UserRepository getUserBookings method, this is userID:", userId);

            const bookings = await this.bookingModel.find({ doctorId })
                .populate('doctorId') // populate doctor details
                .populate('slotId')   // populate slot details
                .populate('userId');  // optional: to populate user info if needed
            // console.log("doctorside", bookings);

            return bookings;
        } catch (error) {
            console.error("Error fetching user bookings:", error);
            throw error;
        }
    };



    getWalletData = async (doctorId: string) => {
        try {
            const wallet = await this.doctorWalletModel.findOne({ doctorId });
            return wallet; // or throw if not found
        } catch (error) {
            console.error('Error fetching doctor wallet:', error);
            throw new Error('Failed to fetch wallet');
        }
    };

    getBookedUser = async (doctorId: string) => {
        try {
            const bookings = await this.bookingModel.find({ doctorId })
                .populate('userId')
                .populate('slotId')   // only select needed fields
                .exec();
            // console.log("This is booked users", bookings)
            // Extract user data from populated bookings
            // const users = bookings.map(booking => booking.userId);
            const users = bookings.map(booking => {
                const user = booking.userId as any;
                const slot = booking.slotId as any;

                return {
                    bookingId: booking._id,
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    profileIMG: user.profileIMG,
                    bloodGroup: user.bloodGroup,
                    age: user.age,
                    gender: user.gender,
                    consultationStatus: booking.consultationStatus,

                    // Include slot info
                    slotId: {
                        _id: slot._id,
                        date: slot.date,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        status: slot.status,
                    }
                };
            });

            return users;


        } catch (error) {
            throw new Error('Failed to fetch booked user data');
        }
    };

    saveMessages = async (messageData: { senderId: string; receiverId: string; message: string; image: string; }) => {
        try {
            const { senderId, receiverId, message, image } = messageData;

            // console.log("Inside repo", messageData);


            let conversation = await this.conversationModel.findOne({
                participants: { $all: [senderId, receiverId] },
            });

            if (!conversation) {
                conversation = await this.conversationModel.create({
                    participants: [senderId, receiverId],
                    messages: [],
                });
            }


            const newMessage = await this.messageModel.create({
                senderId,
                receiverId,
                message,
                image
            });

            // Step 4: Push the message into conversation's messages array
            conversation.messages.push(newMessage._id);
            await conversation.save();

            return newMessage;
        } catch (error) {
            console.error("Error in saveMessages:", error);
            throw error;
        }
    };



    findMessage = async (receiverId: string, senderId: string) => {
        try {
            const conversation = await this.conversationModel.findOne({
                participants: { $all: [receiverId, senderId] },
            }).populate('messages');

            if (!conversation) {
                return [];
            }
            // console.log(conversation.messages);

            return conversation.messages;
        } catch (error) {
            console.error('Error finding conversation:', error);
            throw error;
        }
    };

    deleteSlot = async (slotId: string) => {
        try {
            return await this.slotModel.findByIdAndDelete(slotId)

        } catch (error) {
            return error
        }
    }

    savePrescription = async (presData: any) => {
        try {


            const updatedBooking = await this.bookingModel.findByIdAndUpdate(
                presData.bookingId,
                { consultationStatus: "completed" },
                { new: true }
            );
            if (!updatedBooking) {
                throw new Error("Booking not found");
            }
            const newPrescription = new this.prescriptionModel(presData);
            await newPrescription.save();
        } catch (error) {
            return error
        }
    };

    getPrescription = async (bookingId: string) => {
        try {
            const data = await this.prescriptionModel.findOne({ bookingId });

            return data
        } catch (error) {
            console.error("Error fetching prescription:", error);
            throw error;
        }
    }

    doctorDashboard = async (doctorId: string) => {


        try {
            const totalAppointments = await this.bookingModel.countDocuments({

                doctorId: doctorId
            });
            // console.log("totalAppointments : ", totalAppointments);

            const activePatients = await this.userModel.countDocuments({ isUserBlocked: false });
            // console.log('Active Users:', activePatients);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Convert to string since your slot date is stored as a string (e.g., "2025-05-29")
            const todayStr = today.toISOString().split("T")[0];

            const upcomingAppointments = await this.bookingModel.find()
                .populate({
                    path: "slotId",
                    match: {
                        doctorId: new mongoose.Types.ObjectId(doctorId),
                        date: { $gte: todayStr },
                    },
                })
                .sort({ "slotId.date": 1 })
                .lean();

            // Filter out bookings where slotId didn't match (populate returns null)
            const filtered = upcomingAppointments.filter(b => b.slotId);

            // console.log("Upcoming Appointments:", filtered);

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
            // console.log('Total Doctor Revenue:', doctorRevenue);
            // console.log({
            //     totalAppointments: totalAppointments,
            //     activePatients: activePatients,
            //     upcomingAppointments: filtered,
            //     doctorRevenue: doctorRevenue

            // });

            return {
                totalAppointments: totalAppointments,
                activePatients: activePatients,
                upcomingAppointments: filtered,
                doctorRevenue: doctorRevenue

            }


        } catch (error) {

        }
    }
}



export default DoctorReprository