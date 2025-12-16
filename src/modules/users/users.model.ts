import IUser from "./users.interface";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  avatar: {
    type: String,
  },

  // ==========================
  // SOFT DELETE FIELDS
  // ==========================
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUser>("user", UserSchema);
