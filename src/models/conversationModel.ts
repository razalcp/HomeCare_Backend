import { Schema, Types, model } from "mongoose";


export interface IConversation extends Document {
    participants: Types.ObjectId[];
    messages: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}


const conversationSchema = new Schema<IConversation>(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        messages: [
            {
                type: Schema.Types.ObjectId,
                ref: "Message",
                default: [],
            },
        ],
    },
    { timestamps: true }
);

const conversationModel = model<IConversation>("Conversation", conversationSchema);

export default conversationModel;

