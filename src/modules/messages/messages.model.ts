import mongoose, { Schema, HydratedDocument, Model } from "mongoose";
import { IMessage } from "./messages.interface";

export type MessageDocument = HydratedDocument<IMessage>;

const MessageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "conversation",
      required: true,
      index: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    deletedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });

const MessageModel: Model<IMessage> =
  mongoose.models.message || mongoose.model<IMessage>("message", MessageSchema);

export default MessageModel;
