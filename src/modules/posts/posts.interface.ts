import { Document, Types } from "mongoose";

export interface ILike {
  user: Types.ObjectId;
}

export interface IComment {
  user: Types.ObjectId;
  text: string;
  name?: string;
  avatar?: string;
  createdAt?: Date;
}

export interface IPost extends Document {
  user: Types.ObjectId;
  text: string;

  images?: string[];

  name?: string | null;
  avatar?: string | null;

  likes: Types.DocumentArray<ILike>;
  shares: Types.DocumentArray<ILike>;
  comments: Types.DocumentArray<IComment>;

  createdAt: Date;
  updatedAt: Date;
}
