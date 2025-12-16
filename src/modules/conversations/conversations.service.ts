import mongoose from "mongoose";
import ConversationSchema from "./conversations.model";
import { HttpException } from "@core/exceptions";
import { IConversation } from "./conversations.interface";
import UserSchema from "@modules/users/users.model";

export default class ConversationService {
  /**
   * Lấy danh sách conversation của user
   */
  public async getMyConversations(userId: string): Promise<IConversation[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    return ConversationSchema.find({
      members: userObjectId,
      status: "active",
    })
      .sort({ lastMessageAt: -1 })
      .populate("lastMessage")
      .exec();
  }

  /**
   * Tạo private conversation
   */
  public async createPrivateConversation(
    userId: string,
    targetUserId: string
  ): Promise<IConversation> {
    if (userId === targetUserId) {
      throw new HttpException(400, "Cannot chat with yourself");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const targetObjectId = new mongoose.Types.ObjectId(targetUserId);

    const targetUser = await UserSchema.findById(targetObjectId).exec();
    if (!targetUser) {
      throw new HttpException(404, "Target user not found");
    }

    const members = [userObjectId, targetObjectId].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );

    const existedConversation = await ConversationSchema.findOne({
      type: "private",
      members,
    }).exec();

    if (existedConversation) return existedConversation;

    const conversation = await ConversationSchema.create({
      type: "private",
      members,
    });

    return conversation;
  }

  /**
   * Tạo group conversation
   */
  public async createGroupConversation(
    userId: string,
    memberIds: string[],
    groupId: string
  ): Promise<IConversation> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const members = Array.from(new Set([userId, ...memberIds])).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    if (members.length < 2) {
      throw new HttpException(400, "Group must have at least 2 members");
    }

    const conversation = await ConversationSchema.create({
      type: "group",
      members,
      group: new mongoose.Types.ObjectId(groupId),
      createdBy: userObjectId,
    });

    return conversation;
  }

  /**
   * Archive conversation
   */
  public async archiveConversation(
    userId: string,
    conversationId: string
  ): Promise<IConversation> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversation = await ConversationSchema.findById(
      conversationId
    ).exec();

    if (!conversation) {
      throw new HttpException(404, "Conversation not found");
    }

    if (!conversation.members.some((id) => id.equals(userObjectId))) {
      throw new HttpException(403, "No permission");
    }

    conversation.status = "archived";
    await conversation.save();

    return conversation;
  }
}
