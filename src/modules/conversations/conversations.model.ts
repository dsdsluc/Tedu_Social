import mongoose, { Schema, Model } from "mongoose";
import { IConversation } from "./conversations.interface";

const ConversationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      default: "private",
      required: true,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],

    group: {
      type: Schema.Types.ObjectId,
      ref: "group",
      default: null,
    },

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "message",
      default: null,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },

    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }
);

// index
ConversationSchema.index({ members: 1 });
ConversationSchema.index(
  { members: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "private" } }
);

const ConversationModel: Model<IConversation> =
  mongoose.models.conversation ||
  mongoose.model<IConversation>("conversation", ConversationSchema);

export default ConversationModel;
