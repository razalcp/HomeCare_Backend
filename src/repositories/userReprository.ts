import { IUserRepository } from "../interfaces/user/IUserReprository";
import { IUserModel } from "../interfaces/user/userModelInterface";
import { Model, ObjectId, SortOrder } from "mongoose";
import { IBookedDoctorForChat, IDoctorSlot, IMessageSaveResponse, IMessageUser, IReviewResponse, IReviewSubmit, IUpdateUserProfileImage, IUpdateUserProfileInput, IUser, IUserBooking, IUserResponseFull, IVerifiedDoctorData, IVerifiedDoctorsResponse, TransformedImageObject } from "../interfaces/user/userInterface";
import { IDoctor } from "../models/doctor/doctorModel";
import { ISlot } from "../models/doctor/slotModel";
import { IBooking } from "../models/user/bookingModel";
import { IWallet } from "../models/doctor/doctorWalletModel";
import { IAdminWallet } from "../models/admin/adminWalletModel";
import { IUserWallet } from "../models/user/userWalletModel";
import BaseRepository from "./baseRepository";
import { IPrescription } from "../models/doctor/prescriptionModel";
import { Types } from "mongoose";
import { IConversation } from "../models/conversationModel";
import { IMessage } from "../models/messageModel";
import { IReview } from "../models/user/reviewModel";
import { IPrescriptionResponse } from "../interfaces/doctor/doctorInterface";
import { mapDoctorsToResponse } from "../helpers/mapDoctors";
import { mapBookingsToUserResponse } from "../helpers/mapBookings";
import { mapReviewDocument, PopulatedReviewDocument } from "../helpers/mapReview";
import { mapMessages } from "../helpers/mapMessages";


class UserReprository extends BaseRepository<any> implements IUserRepository {
  private userModel: Model<IUserModel>;
  private doctorModel: Model<IDoctor>
  private slotModel: Model<ISlot>
  private bookingModel: Model<IBooking>
  private doctorWalletModel: Model<IWallet>
  private adminWalletModel: Model<IAdminWallet>
  private userWalletModel: Model<IUserWallet>
  private prescriptionModel: Model<IPrescription>
  private conversationModel: Model<IConversation>
  private messageModel: Model<IMessage>
  private reviewModel: Model<IReview>

  constructor(userModel: Model<IUserModel>, doctorModel: Model<IDoctor>, slotModel: Model<ISlot>, bookingModel: Model<IBooking>, doctorWalletModel: Model<IWallet>, adminWalletModel: Model<IAdminWallet>, userWalletModel: Model<IUserWallet>, conversationModel: Model<IConversation>, messageModel: Model<IMessage>, reviewModel: Model<IReview>, prescriptionModel: Model<IPrescription>) {
    super(userModel)
    this.userModel = userModel;
    this.doctorModel = doctorModel
    this.slotModel = slotModel
    this.bookingModel = bookingModel
    this.doctorWalletModel = doctorWalletModel
    this.adminWalletModel = adminWalletModel
    this.userWalletModel = userWalletModel
    this.conversationModel = conversationModel
    this.messageModel = messageModel
    this.reviewModel = reviewModel
    this.prescriptionModel = prescriptionModel
  }

  findByEmail = async (email: string): Promise<IUser | null> => {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  };

  register = async (userData: IUser): Promise<IUserModel> => {
    try {
      return await this.userModel.create(userData);
    } catch (error) {
      throw error;
    }
  };

  login = async (email: string): Promise<IUserModel | null> => {
    try {
      const singleUser = await this.userModel.findOne({ email })
      if (!singleUser) {
        throw new Error("User not found")
      }

      if (singleUser.isUserBlocked === false) {

        return singleUser;
      } else {
        throw new Error("User is blocked")
      }

    } catch (error) {
      throw error
    }
  }


  getVerifiedDoctors = async (
    page: number,
    limit: number,
    search: string,
    sort: string,
    departments: string[],
    minFee: number,
    maxFee: number
  ): Promise<IVerifiedDoctorsResponse> => {
    try {
      const query: {
        kycStatus: string, name?: { '$regex': string, '$options': string },
        department?: { $in: string[] }, consultationFee?: { "$gte": number, "$lte": number };
      } = {
        kycStatus: "Approved",

      };


      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      if (departments?.length > 0) {
        query.department = { $in: departments };
      }

      if (minFee !== undefined && maxFee !== undefined) {
        query.consultationFee = { $gte: minFee, $lte: maxFee };
      }

      const sortOption: Record<string, SortOrder> = {};
      if (sort === "fee-asc") sortOption.consultationFee = 1;
      else if (sort === "fee-desc") sortOption.consultationFee = -1;

      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.doctorModel.find(query).sort(sortOption).skip(skip).limit(limit),
        this.doctorModel.countDocuments(query)
      ]);
      const mappedDoctors = mapDoctorsToResponse(data);
      return { data: mappedDoctors, total };
    } catch (error) {
      throw error;
    }
  };

  saveWalletBookingToDb = async (slotId: string, userId: string, doctorId: string, docFees: number) => {
    try {
      const wallet = await this.userWalletModel.findOne({ userId });

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // 2. Check balance
      if (wallet.balance < docFees) {
        throw new Error("Insufficient Wallet Balance");
      }

      // await wallet.save()

      if (slotId) {
        const slot = await this.slotModel.findById(slotId);

        if (!slot) {
          throw new Error("Slot not found");
        }

        if (slot.isBooked) {
          throw new Error("Slot already booked");
        }

        await this.slotModel.findByIdAndUpdate(slotId, {
          isBooked: true,
          status: "Booked"
        });


      }
      // Step 2: Save booking
      const newBooking = await this.bookingModel.create({
        doctorId,
        userId,
        slotId,
        paymentStatus: "paid",
        bookingStatus: "booked"
      });

      await newBooking.save();

      // 3. Get doctor's fee
      const doctor = await this.doctorModel.findById(doctorId);
      if (!doctor) throw new Error("Doctor not found");

      const doctorFees = doctor.consultationFee; // assuming `fees` field exists in doctor collection

      if (doctorFees === undefined) {
        throw new Error("Consultation fee is not set for this doctor.");
      }

      const doctorShare = Math.floor(doctorFees * 0.7);
      const adminShare = doctorFees - doctorShare;

      // const bookingId = newBooking._id.toString();
      const bookingId = (newBooking._id as Types.ObjectId).toString();

      if (wallet) {
        wallet.balance -= docFees;
        wallet.transactions.push({
          amount: docFees,
          transactionId: bookingId,
          transactionType: "debit",
          appointmentId: bookingId
        });
        await wallet.save()
      }

      // 4. Update Doctor Wallet
      const doctorWallet = await this.doctorWalletModel.findOne({ doctorId });


      if (doctorWallet) {
        doctorWallet.balance += doctorShare;
        doctorWallet.transactions.push({
          amount: doctorShare,
          transactionId: bookingId,
          transactionType: "credit",
          appointmentId: bookingId
        });
        await doctorWallet.save();
      } else {
        // If wallet doesn't exist, create it
        const wal = await this.doctorWalletModel.create({
          doctorId,
          balance: doctorShare,
          transactions: [{
            amount: doctorShare,
            transactionId: bookingId,
            transactionType: "credit",
            appointmentId: bookingId
          }]
        });


      }
      const adminId = "admin"; // or however you define it

      let adminWallet = await this.adminWalletModel.findOne({ adminId });

      if (!adminWallet) {
        // If no wallet exists, create one
        adminWallet = await this.adminWalletModel.create({
          adminId,
          balance: adminShare,
          transactions: [{
            amount: adminShare,
            transactionId: bookingId,
            transactionType: "credit",
            appointmentId: bookingId
          }]
        });

      } else {
        // Update existing wallet
        adminWallet.balance += adminShare;
        adminWallet.transactions.push({
          amount: adminShare,
          transactionId: bookingId,
          transactionType: "credit",
          appointmentId: bookingId
        });
        await adminWallet.save();

      }

      return "Wallet Booking Successful"

    } catch (error) {
      throw error
    }
  };


  saveBookingToDb = async (slotId: string, userId: string, doctorId: string) => {
    try {
      if (slotId) {
        const slot = await this.slotModel.findById(slotId);

        if (!slot) {
          throw new Error("Slot not found");
        }

        if (slot.isBooked) {
          throw new Error("Slot already booked");
        }

        await this.slotModel.findByIdAndUpdate(slotId, {
          isBooked: true,
          status: "Booked"
        });


      }
      // Step 2: Save booking
      const newBooking = await this.bookingModel.create({
        doctorId,
        userId,
        slotId,
        paymentStatus: "paid",
        bookingStatus: "booked"
      });

      await newBooking.save();

      // 3. Get doctor's fee
      const doctor = await this.doctorModel.findById(doctorId);
      if (!doctor) throw new Error("Doctor not found");

      const doctorFees = doctor.consultationFee; // assuming `fees` field exists in doctor collection

      if (doctorFees === undefined) {
        throw new Error("Consultation fee is not set for this doctor.");
      }
      const doctorShare = Math.floor(doctorFees * 0.7);
      const adminShare = doctorFees - doctorShare;

      // const bookingId = newBooking._id.toString();
      const bookingId = (newBooking._id as Types.ObjectId).toString();

      // 4. Update Doctor Wallet
      const doctorWallet = await this.doctorWalletModel.findOne({ doctorId });

      if (doctorWallet) {
        doctorWallet.balance += doctorShare;
        doctorWallet.transactions.push({
          amount: doctorShare,
          transactionId: bookingId,
          transactionType: "credit",
          appointmentId: bookingId
        });
        await doctorWallet.save();
      } else {


        // If wallet doesn't exist, create it
        const wal = await this.doctorWalletModel.create({
          doctorId,
          balance: doctorShare,
          transactions: [{
            amount: doctorShare,
            transactionId: bookingId,
            transactionType: "credit",
            appointmentId: bookingId
          }]
        });


      }
      const adminId = "admin"; // or however you define it

      let adminWallet = await this.adminWalletModel.findOne({ adminId });

      if (!adminWallet) {
        // If no wallet exists, create one
        adminWallet = await this.adminWalletModel.create({
          adminId,
          balance: adminShare,
          transactions: [{
            amount: adminShare,
            transactionId: bookingId,
            transactionType: "credit",
            appointmentId: bookingId
          }]
        });

      } else {
        // Update existing wallet
        adminWallet.balance += adminShare;
        adminWallet.transactions.push({
          amount: adminShare,
          transactionId: bookingId,
          transactionType: "credit",
          appointmentId: bookingId
        });
        await adminWallet.save();

      }

    } catch (error) {
      throw error
    }
  }

  getUserBookings = async (userId: string): Promise<IUserBooking[]> => {
    try {
      const bookings = await this.bookingModel.find({ userId })
        .sort({ createdAt: -1 })
        .populate('doctorId') // populate doctor details
        .populate('slotId')   // populate slot details
        .populate('userId')
        .lean();
      return mapBookingsToUserResponse(bookings);

    } catch (error) {
      console.error("Error fetching user bookings:", error);
      throw error;
    }
  };



  cancelBooking = async (bookingId: string) => {
    try {
      // Step 1: Find the booking
      const booking = await this.bookingModel.findById(bookingId);
      if (!booking) throw new Error('Booking not found');

      const { slotId, doctorId, userId } = booking;

      // Step 2: Update the slot as available
      await this.slotModel.findByIdAndUpdate(slotId, {
        status: 'Available',
        isBooked: false,
      });

      // Step 3: Get doctor wallet and find the matching transaction
      const doctorWallet = await this.doctorWalletModel.findOne({ doctorId });
      if (!doctorWallet) throw new Error('Doctor wallet not found');

      const transaction = doctorWallet.transactions.find(
        (tx: {
          amount?: number;
          transactionId?: string;
          transactionType?: 'credit' | 'debit';
          appointmentId?: string;
          _id?: Types.ObjectId;
          date?: Date;
        }) => {
          return tx.transactionId === bookingId
        });
      if (!transaction) throw new Error('Transaction not found in doctor wallet');

      const amountToRefund = transaction.amount;

      // Step 4: Deduct amount from doctor and save debit transaction
      doctorWallet.balance -= amountToRefund;
      doctorWallet.transactions.push({
        amount: amountToRefund,
        transactionId: bookingId,
        transactionType: 'debit',
        appointmentId: bookingId,
        date: new Date(),
      });
      await doctorWallet.save();

      // Step 5: Find or create user wallet
      let userWallet = await this.userWalletModel.findOne({ userId });

      if (!userWallet) {
        userWallet = await this.userWalletModel.create({
          userId,
          balance: amountToRefund,
          transactions: [{
            amount: amountToRefund,
            transactionId: bookingId,
            transactionType: 'credit',
            appointmentId: bookingId,
            date: new Date(),
          }],
        });
      } else {
        userWallet.balance += amountToRefund;
        userWallet.transactions.push({
          amount: amountToRefund,
          transactionId: bookingId,
          transactionType: 'credit',
          appointmentId: bookingId,
          date: new Date(),
        });
      }

      await userWallet.save();

      // Step 6: Delete the booking

      await this.bookingModel.findByIdAndUpdate(bookingId, {
        bookingStatus: 'cancelled',
        paymentStatus: 'refunded'
      })

      return { message: "Booking Cancelled Successfully" }
    } catch (error) {
      console.error('Error in cancelBooking:', error);
      throw error;
    }
  };



  getWalletData = async (userId: string, page: number, limit: number) => {
    try {
      const wallet = await this.userWalletModel.findOne({ userId });

      if (!wallet) throw new Error('Wallet not found');

      const totalTransactions = wallet.transactions.length;
      const totalPages = Math.ceil(totalTransactions / limit);
      const startIndex = (page - 1) * limit;

      const paginatedTransactions = wallet.transactions
        .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
        .slice(startIndex, startIndex + limit)
        .map((tx: {
          amount?: number;
          transactionId?: string;
          transactionType?: 'credit' | 'debit';
          appointmentId?: string;
          _id?: Types.ObjectId;
          date?: Date;
        }) => {
          if (
            !tx._id ||
            tx.amount === undefined ||
            !tx.transactionId ||
            !tx.transactionType ||
            !tx.appointmentId ||
            !tx.date
          ) {
            throw new Error("Incomplete transaction data");
          }

          return {
            _id: tx._id?.toString() || '',
            amount: tx.amount,
            transactionId: tx.transactionId,
            transactionType: tx.transactionType,
            appointmentId: tx.appointmentId,
            date: tx.date,
          }
        });


      return {
        _id: wallet._id.toString(),
        userId: wallet.userId.toString(),
        balance: wallet.balance,
        transactions: paginatedTransactions,
        totalTransactions,
        currentPage: page,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching paginated wallet:', error);
      throw new Error('Failed to fetch wallet');
    }
  };


  updateUser = async (userData: IUpdateUserProfileInput, imgObject: IUpdateUserProfileImage) => {

    const existingUser = await this.userModel.findOne({ email: userData.email });

    if (existingUser) {

      let transformedImgObject: TransformedImageObject = {};

      if (imgObject?.profileImage) {
        transformedImgObject.profileIMG = imgObject.profileImage;
      }

      const updatedUser = await this.userModel.findOneAndUpdate(
        { email: userData.email },
        { $set: { ...userData, ...transformedImgObject } },
        { new: true }
      );

      return updatedUser;
    } else {
      throw new Error("Email not registered");
    }
  };


  getUser = async (email: string): Promise<IUserResponseFull | null> => {
    try {
      const data = await this.userModel.findOne({ email }).lean();

      if (!data) return null;

      const mappedUser: IUserResponseFull = {
        ...data,
        _id: data._id.toString(),
        profileIMG: data.profileIMG ?? "",
      };

      return mappedUser;
    } catch (error) {
      throw error;
    }
  };

  getBookedDoctor = async (userId: string) => {
    try {
      const bookings = await this.bookingModel.find({ userId })
        .populate('doctorId', 'name email profileImage') // only select needed fields
        .exec();
      // Extract user data from populated bookings
      const doctors = bookings.map(booking => booking.doctorId as unknown as IBookedDoctorForChat);
      return doctors

    } catch (error) {
      throw new Error('Failed to fetch booked user data');
    }
  };

  findMessage = async (receiverId: string, senderId: string): Promise<IMessageUser[]> => {
    try {
      const conversation = await this.conversationModel.findOne({
        participants: { $all: [receiverId, senderId] },
      }).populate('messages');

      if (!conversation) {
        return [];
      }

      return conversation.messages as unknown as IMessageUser[];
    } catch (error) {
      console.error('Error finding conversation:', error);
      throw error;
    }
  };

  saveMessages = async (messageData: { senderId: string; receiverId: string; message: string, image: string; }) => {
    try {
      const { senderId, receiverId, message, image } = messageData;

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
      return mapMessages(newMessage);
    } catch (error) {
      console.error("Error in saveMessages:", error);
      throw error;
    }
  };

  deleteMessage = async (messageId: string): Promise<IMessageSaveResponse | null> => {
    if (!messageId) {
      throw new Error("Message ID is required.");
    }

    const deleted = await this.messageModel.findByIdAndDelete(messageId);
    if (!deleted) throw new Error("Message not found.");

    return {
      _id: deleted._id.toString(),
      senderId: deleted.senderId.toString(),
      receiverId: deleted.receiverId.toString(),
      message: deleted.message,
      image: deleted.image,
      createdAt: deleted.createdAt,
      updatedAt: deleted.updatedAt,
    };
  };


  submitReview = async (reviewData: IReviewSubmit): Promise<IReviewResponse> => {
    try {
      const { userId, doctorId, rating, comment } = reviewData;

      // Check if a review already exists
      const existingReview = await this.reviewModel.findOne({ userId, doctorId });


      if (existingReview) {


        throw new Error("Review already added for this doctor");
      }

      // Create a new review
      const newReview = new this.reviewModel({
        userId,
        doctorId,
        rating,
        comment,
      });

      await newReview.save();
      const allReviews = await this.reviewModel.find({ doctorId }).populate('userId', 'name profileIMG');

      const formattedReviews = (allReviews as unknown as PopulatedReviewDocument[]).map(mapReviewDocument);
      return {
        success: true,
        message: "Review submitted successfully",
        data: formattedReviews,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error.message;
      }
      throw 'An unknown error occurred';
    }
  };

  reviewDetails = async (doctorId: string) => {
    try {
      const allReviews = await this.reviewModel.find({ doctorId }).populate('userId', 'name profileIMG');
      const formattedReviews = (allReviews as unknown as PopulatedReviewDocument[]).map(mapReviewDocument);
      return {
        success: true,
        message: "Review submitted successfully",
        data: formattedReviews,
      };
    } catch (error) {
      throw error
    }
  };



  getDoctorSlotsForBooking = async (doctorId: string): Promise<IDoctorSlot[]> => {
    const slots = await this.slotModel.find({ doctorId, status: "Available" }).lean();
    return slots as unknown as IDoctorSlot[];
  };

  getPrescription = async (bookingId: string): Promise<IPrescriptionResponse | null> => {
    try {

      const data = await this.prescriptionModel.findOne({ bookingId }) as (IPrescription & { _id: Types.ObjectId, createdAt: Date, updatedAt: Date });

      if (!data) {
        throw new Error("Prescription not found");
      }
      const response: IPrescriptionResponse = {
        _id: data._id.toString(),
        bookingId: data.bookingId.toString(),
        patientAdvice: data.patientAdvice,
        medications: data.medications,
        userId: data.userId.toString(),
        doctorId: data.doctorId.toString(),
        createdAt: data.createdAt.toISOString(),
        updatedAt: data.updatedAt.toISOString(),
      };

      return response;
    } catch (error) {
      console.error("Error fetching prescription:", error);
      throw error;
    }
  };

};

export default UserReprository;
