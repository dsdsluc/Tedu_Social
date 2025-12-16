import { Document, Types } from "mongoose";

export interface IFollower {
  user: Types.ObjectId;
}

export interface IFriend {
  user: Types.ObjectId;
  date?: Date;
}

export interface IExperience {
  _id?: Types.ObjectId;
  title: string;
  company: string;
  location?: string;
  from: Date;
  to?: Date;
  current: boolean;
  description?: string;
}

export interface IEducation {
  _id?: Types.ObjectId;
  school: string;
  degree: string;
  fieldofstudy: string;
  from: Date;
  to?: Date;
  current: boolean;
  description?: string;
}

export interface ISocial {
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
}

export interface IProfile extends Document {
  user: Types.ObjectId;

  company?: string;
  website?: string;
  location?: string;
  status?: string;
  skills: string[];
  bio?: string;

  experience: Types.DocumentArray<IExperience>;
  education: Types.DocumentArray<IEducation>;

  social?: ISocial;

  // =========================
  // FOLLOW SYSTEM
  // =========================
  followings: Types.DocumentArray<IFollower>;
  followers: Types.DocumentArray<IFollower>;

  // =========================
  // FRIEND SYSTEM (NEW)
  // =========================
  friends: Types.DocumentArray<IFriend>;
  friendRequestsSent: Types.DocumentArray<IFriend>;
  friendRequestsReceived: Types.DocumentArray<IFriend>;

  createdAt: Date;
  updatedAt: Date;
}
