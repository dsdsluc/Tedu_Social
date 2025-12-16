import mongoose, { Document } from "mongoose";
import { IGroup } from "./groups.interface";

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    description: {
      type: String,
    },

    // =========================
    // CREATOR
    // =========================
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // =========================
    // MANAGERS
    // =========================
    managers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "mod"],
          default: "admin",
        },
      },
    ],

    // =========================
    // MEMBERS
    // =========================
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
      },
    ],

    // =========================
    // JOIN REQUESTS
    // =========================
    memberRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // ✅ thay cho date
  }
);

export default mongoose.model<IGroup & Document>("group", GroupSchema);
