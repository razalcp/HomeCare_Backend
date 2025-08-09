
import IDoctorModel from "../interfaces/doctor/doctorModelInterface"
import IDoctorReprository from "../interfaces/doctor/IDoctorReprository"
import mongoose, { Model, Types } from 'mongoose'
import { IDepartment } from "../models/admin/departmentModel"
import { ISlot } from "../models/doctor/slotModel"
import { IBooking } from "../models/user/bookingModel"
import { IWallet } from "../models/doctor/doctorWalletModel"
import { IUserModel } from "../interfaces/user/userModelInterface"
import { IBookedUser, IBookingSummary, IBookingWithPopulatedFields, IDoctorDashboard, IDoctorImageUpload, IDoctorKycRegisterInput, IGetMyBookingsResponse, ILeanPopulatedBooking, IMessageFromDoctor, IPrescriptionRequest, IUpcomingAppointment, IWalletTransaction, PopulatedBookingDashBoard } from "../interfaces/doctor/doctorInterface"
import { PopulatedBooking } from "../interfaces/doctor/doctorInterface"
import { IMessage } from "../models/messageModel"
import { IConversation } from "../models/conversationModel"
import { IPrescription } from "../models/doctor/prescriptionModel"


class DoctorReprository implements IDoctorReprository {
    private _doctorModel: Model<IDoctorModel>
    private _departmentModel: Model<IDepartment>
    private _slotModel: Model<ISlot>
    private _bookingModel: Model<IBooking>
    private _doctorWalletModel: Model<IWallet>
    private _messageModel: Model<IMessage>
    private _conversationModel: Model<IConversation>
    private _prescriptionModel: Model<IPrescription>
    private _userModel: Model<IUserModel>

    constructor(doctorModel: Model<IDoctorModel>, departmentModel: Model<IDepartment>, slotModel: Model<ISlot>, bookingModel: Model<IBooking>, doctorWalletModel: Model<IWallet>, messageModel: Model<IMessage>, conversationModel: Model<IConversation>, prescriptionModel: Model<IPrescription>, userModel: Model<IUserModel>) {

        this._doctorModel = doctorModel
        this._departmentModel = departmentModel
        this._slotModel = slotModel
        this._bookingModel = bookingModel
        this._doctorWalletModel = doctorWalletModel
        this._messageModel = messageModel
        this._conversationModel = conversationModel
        this._prescriptionModel = prescriptionModel
        this._userModel = userModel

    }

    findByEmail = async (email: string): Promise<{ email?: string } | null> => {

        try {
            return await this._doctorModel.findOne({ email }).select('email').lean()
        } catch (error) {
            throw error
        }
    }

    findEmailForLogin = async (email: string): Promise<IDoctorModel | null> => {
        try {
            const doct = await this._doctorModel.findOne({ email })
            return doct
        } catch (error) {
            throw error
        }
    }

    doctorRepoKycRegister = async (doctorData: IDoctorKycRegisterInput, imgObject: IDoctorImageUpload) => {
        const existingUser = await this._doctorModel.findOne({ email: doctorData.email })
        if (existingUser) {
            const updatedUser = await this._doctorModel.findOneAndUpdate(
                { email: doctorData.email },
                { $set: { ...doctorData, ...imgObject } },
                { new: true }
            )
            return updatedUser
        } else {
            throw new Error("Email not registered")
        }

    };

    updateDoctor = async (doctorData: IDoctorModel, imgObject: { profileImage: string }): Promise<void | IDoctorModel | null> => {

        const existingUser = await this._doctorModel.findOne({ email: doctorData.email })

        if (existingUser) {

            const updatedUser = await this._doctorModel.findOneAndUpdate(
                { email: doctorData.email },
                { $set: { ...doctorData, ...imgObject } },
                { new: true }
            )
            return updatedUser
        } else {
            throw new Error("Email not registered")
        }

    };

    register = async (regEmail: string | null) => {

        const obj = { email: regEmail }

        try {
            const alreadyExistingUser = await this._doctorModel.findOne({ email: regEmail })
            if (!alreadyExistingUser) {
                return await this._doctorModel.create(obj)
            }
            return alreadyExistingUser
        } catch (error) {
            throw error
        }

    };

    getDepartments = async () => {
        const data = await this._departmentModel.find(
            { isListed: true }, // Filter: isListed should be true
            { _id: 0, departmentName: 1 } // Projection: Only return departmentName, exclude _id
        );
        return data

    };


    addDoctorSlots = async (slotData: ISlot | ISlot[]) => {
        try {
            if (Array.isArray(slotData)) {
                // Handling array case

                for (const slot of slotData) {
                    const existingSlot = await this._slotModel.findOne({
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
                await this._slotModel.insertMany(slotData);
            } else {
                // Handling object case
                const existingSlot = await this._slotModel.findOne({
                    doctorId: slotData.doctorId,
                    date: slotData.date,
                    startTime: slotData.startTime,
                    endTime: slotData.endTime
                });

                if (existingSlot) {
                    throw new Error(`Slot already added for ${slotData.date} from ${slotData.startTime} to ${slotData.endTime}`);
                }

                // Insert new slot
                const newSlot = new this._slotModel(slotData);
                await newSlot.save();
            }

            return { success: true, message: "Slot(s) added successfully" };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unknown error occurred");
            }
        }

    };

    getDoctorSlotsForBooking = async (doctorId: string) => {
        return await this._slotModel.find({ doctorId });
    };

    getDoctorSlots = async (doctorId: string, page: number, limit: number) => {
        const skip = (page - 1) * limit;
        const [slots, total] = await Promise.all([
            this._slotModel.find({ doctorId }).skip(skip).limit(limit),
            this._slotModel.countDocuments({ doctorId }),
        ]);

        return { slots, total };
    };

    getMyBookings = async (
        doctorId: string,
        page: number,
        limit: number
    ): Promise<IGetMyBookingsResponse> => {
        try {
            const skip = (page - 1) * limit;

            const [bookings, totalCount] = await Promise.all([
                this._bookingModel
                    .find({ doctorId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate({ path: 'userId', select: 'name' })
                    .populate({ path: 'slotId', select: 'date startTime endTime' })
                    .select('userId slotId paymentStatus consultationStatus createdAt')
                    .lean<ILeanPopulatedBooking[]>(),
                this._bookingModel.countDocuments({ doctorId }),
            ]);

            const totalPages = Math.ceil(totalCount / limit);

            const mappedBookings: IBookingSummary[] = bookings.map((b) => ({
                _id: b._id.toString(),
                userId: {
                    _id: b.userId._id.toString(),
                    name: b.userId.name,
                },
                slotId: {
                    _id: b.slotId._id.toString(),
                    date: b.slotId.date,
                    startTime: b.slotId.startTime,
                    endTime: b.slotId.endTime,
                },
                paymentStatus: b.paymentStatus,
                consultationStatus: b.consultationStatus,
                createdAt: b.createdAt,
            }));

            return { bookings: mappedBookings, totalPages };
        } catch (error) {
            console.error("Error fetching paginated bookings:", error);
            throw error;
        }
    };



    getWalletData = async (doctorId: string, page: number, limit: number) => {
        try {
            const skip = (page - 1) * limit;

            // Find the wallet
            const wallet = await this._doctorWalletModel.findOne({ doctorId });

            if (!wallet) return null;

            // Clone the transactions array for pagination
            const totalTransactions = wallet.transactions.length;
            const paginatedTransactions = wallet.transactions
                .slice()
                .reverse()
                .slice(skip, skip + limit); // Latest transactions first

            return {
                wallet: {
                    _id: wallet._id,
                    doctorId: wallet.doctorId,
                    balance: wallet.balance,
                    transactions: paginatedTransactions.filter((tx): tx is IWalletTransaction => tx._id !== undefined),
                    createdAt: wallet.createdAt ?? new Date(),
                    updatedAt: wallet.updatedAt ?? new Date(),
                },
                totalPages: Math.ceil(totalTransactions / limit),
            };
        } catch (error) {
            console.error('Repository error fetching doctor wallet:', error);
            throw new Error('Failed to fetch wallet');
        }
    };

    getBookedUsers = async (doctorId: string): Promise<IBookedUser[]> => {
        try {

            const bookings = await this._bookingModel.find({ doctorId })
                .populate('userId')
                .populate('slotId')   // only select needed fields
                .exec() as unknown as PopulatedBooking[];

            // Extract user data from populated bookings

            const users = ((bookings as unknown) as IBookingWithPopulatedFields[]).map((booking) => {
                const user = booking.userId;
                const slot = booking.slotId;

                return {
                    bookingId: booking._id.toString(),
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    profileIMG: user.profileIMG ?? "",
                    bloodGroup: user.bloodGroup ?? "",
                    age: user.age ?? 0,
                    gender: user.gender ?? "Not specified",
                    consultationStatus: booking.consultationStatus,
                    bookingStatus: booking.bookingStatus,
                    slotId: {
                        _id: slot._id.toString(),
                        date: slot.date,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        status: slot.status as "Available" | "Booked" | "Cancelled",
                    },
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

            let conversation = await this._conversationModel.findOne({
                participants: { $all: [senderId, receiverId] },
            });

            if (!conversation) {
                conversation = await this._conversationModel.create({
                    participants: [senderId, receiverId],
                    messages: [],
                });
            }


            const newMessage = await this._messageModel.create({
                senderId,
                receiverId,
                message,
                image
            });

            // Step 4: Push the message into conversation's messages array
            conversation.messages.push(newMessage._id);
            await conversation.save();

            return {
                _id: newMessage._id as Types.ObjectId,
                senderId: newMessage.senderId.toString(),
                receiverId: newMessage.receiverId.toString(),
                message: newMessage.message ?? '',
                image: newMessage.image ?? null,
                createdAt: newMessage.createdAt!,
                updatedAt: newMessage.updatedAt!,
            };


        } catch (error) {
            console.error("Error in saveMessages:", error);
            throw error;
        }
    };


    findMessage = async (
        receiverId: string,
        senderId: string
    ): Promise<IMessageFromDoctor[]> => {
        try {
            const conversation = await this._conversationModel
                .findOne({
                    participants: { $all: [receiverId, senderId] },
                })
                .populate("messages");

            if (!conversation) {
                return [];
            }

            const messages = conversation.messages as unknown as IMessage[];

            return messages.map((msg) => ({
                _id: msg._id,
                senderId: msg.senderId.toString(),
                receiverId: msg.receiverId.toString(),
                message: msg.message ?? "",
                image: msg.image ?? null,
                createdAt: msg.createdAt,
                updatedAt: msg.updatedAt,
            }));
        } catch (error) {
            console.error("Error finding conversation:", error);
            throw error;
        }
    };

    deleteSlot = async (slotId: string): Promise<string> => {
        try {
            const deleted = await this._slotModel.findByIdAndDelete(slotId);

            if (!deleted) {
                throw new Error("Slot not found");
            }

            return "Slot deleted successfully";
        } catch (error) {
            throw error;
        }
    };


    savePrescription = async (presData: IPrescriptionRequest): Promise<string> => {
        try {


            const updatedBooking = await this._bookingModel.findByIdAndUpdate(
                presData.bookingId,
                { consultationStatus: "completed" },
                { new: true }
            );
            if (!updatedBooking) {
                throw new Error("Booking not found");
            }
            const newPrescription = new this._prescriptionModel(presData);
            await newPrescription.save();
            return "Prescription added successfully"
        } catch (error) {
            throw new Error('error in saving prescription: ' + error);
        }
    };



    doctorDashboard = async (doctorId: string): Promise<IDoctorDashboard> => {

        try {
            const totalAppointments = await this._bookingModel.countDocuments({
                doctorId: doctorId
            });

            const activePatients = await this._userModel.countDocuments({ isUserBlocked: false });
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Convert to string since your slot date is stored as a string (e.g., "2025-05-29")
            const todayStr = today.toISOString().split("T")[0];

            const upcomingAppointments = await this._bookingModel.find()
                .populate({
                    path: "slotId",
                    match: {
                        doctorId: new mongoose.Types.ObjectId(doctorId),
                        date: { $gte: todayStr },
                    },
                })
                .sort({ "slotId.date": 1 })
                .lean()
                .exec() as unknown as PopulatedBookingDashBoard[];


            // Filter out bookings where slotId didn't match (populate returns null)
            const filtered = upcomingAppointments.filter(b => b.slotId);

            const revenueResult = await this._doctorWalletModel.aggregate([
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


            const mappedAppointments: IUpcomingAppointment[] = filtered.map(booking => ({
                _id: new Types.ObjectId(booking._id),
                doctorId: booking.doctorId as Types.ObjectId,
                userId: new Types.ObjectId(
                    typeof booking.userId === 'string' ? booking.userId : (booking.userId as IUserModel)._id
                ),
                slotId: booking.slotId as ISlot,
                paymentStatus: booking.paymentStatus === "paid" || booking.paymentStatus === "refunded"
                    ? booking.paymentStatus
                    : "paid", // fallback
                bookingStatus: booking.bookingStatus === "booked" || booking.bookingStatus === "cancelled"
                    ? booking.bookingStatus
                    : "booked",
                consultationStatus: booking.consultationStatus === "completed"
                    ? "completed"
                    : "pending",
                createdAt: new Date(booking.createdAt),
                updatedAt: new Date(booking.updatedAt),
                __v: booking.__v ?? 0
            }));

            return {
                totalAppointments: totalAppointments,
                activePatients: activePatients,
                upcomingAppointments: mappedAppointments,
                doctorRevenue: doctorRevenue

            }

        } catch (error) {
            throw error
        }
    };


}


export default DoctorReprository