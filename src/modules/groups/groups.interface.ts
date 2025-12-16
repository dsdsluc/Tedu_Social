import { Types } from "mongoose";

export interface IGroupMember {
  user: Types.ObjectId;
}

export interface IGroupManager {
  user: Types.ObjectId;
  role: "admin" | "mod";
}

export interface IGroupRequest {
  user: Types.ObjectId;
  date?: Date;
}

export interface IGroup {
  name: string;
  code: string;
  description?: string;

  creator: Types.ObjectId;

  managers: IGroupManager[];
  members: IGroupMember[];
  memberRequests: IGroupRequest[];

  createdAt: Date;
  updatedAt: Date;
}
