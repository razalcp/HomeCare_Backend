import mongoose, { Document } from "mongoose";


export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    message?: string;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: false,
        },
        image:
        {
            type: String,
            required: false,
        },

        // createdAt, updatedAt
    },
    { timestamps: true }
);

const messageModel = mongoose.model<IMessage>("Message", messageSchema);

export default messageModel;