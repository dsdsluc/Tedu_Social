import mongoose from "mongoose";
import { IProfile } from "./profile.interface";

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    company: String,
    website: String,
    location: String,

    status: {
      type: String,
      required: true,
    },

    skills: {
      type: [String],
      required: true,
    },

    bio: String,

    // =========================
    // EXPERIENCE
    // =========================
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: String,
        from: { type: Date, required: true },
        to: Date,
        current: { type: Boolean, default: false },
        description: String,
      },
    ],

    // =========================
    // EDUCATION
    // =========================
    education: [
      {
        school: { type: String, required: true },
        degree: { type: String, required: true },
        fieldofstudy: { type: String, required: true },
        from: { type: Date, required: true },
        to: Date,
        current: { type: Boolean, default: false },
        description: String,
      },
    ],

    // =========================
    // SOCIAL
    // =========================
    social: {
      youtube: String,
      twitter: String,
      facebook: String,
      linkedin: String,
      instagram: String,
    },

    // =========================
    // FOLLOW SYSTEM
    // =========================
    followings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],

    followers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],

    // =========================
    // FRIEND SYSTEM (NEW)
    // =========================

    // =========================
    // FRIEND SYSTEM (CLEAR)
    // =========================

    // Danh sách bạn bè
    friends: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Request tôi đã gửi
    friendRequestsSent: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Request tôi nhận được
    friendRequestsReceived: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IProfile>("profile", ProfileSchema);
