import { Types } from "mongoose";

export interface IConversation {
  _id?: Types.ObjectId;

  type: "private" | "group";

  members: Types.ObjectId[];

  group?: Types.ObjectId | null;

  lastMessage?: Types.ObjectId | null;

  lastMessageAt?: Date;

  createdBy?: Types.ObjectId;

  status?: "active" | "archived" | "deleted";

  createdAt?: Date;
  updatedAt?: Date;
}
