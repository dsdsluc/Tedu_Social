import { Types } from "mongoose";

export type MessageType = "text" | "image" | "file" | "system";

export interface IMessage {
  _id?: Types.ObjectId;

  conversation: Types.ObjectId;
  from: Types.ObjectId;
  to?: Types.ObjectId | null;
  text: string;
  read: boolean;
  deletedBy: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
}
