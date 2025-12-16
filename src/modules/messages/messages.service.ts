import mongoose from "mongoose";
import MessageModel from "./messages.model";
import { IMessage } from "./messages.interface";
import ConversationSchema from "@modules/conversations/conversations.model";
import { HttpException } from "@core/exceptions";

export default class MessagesService {
  /**
   * Gửi message
   */
  public async sendMessage(
    userId: string,
    dto: {
      conversationId: string;
      text: string;
      to?: string;
    }
  ): Promise<IMessage> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const conversationObjectId = new mongoose.Types.ObjectId(
      dto.conversationId
    );

    const conversation = await ConversationSchema.findById(
      conversationObjectId
    ).exec();

    if (!conversation) {
      throw new HttpException(404, "Conversation not found");
    }

    if (!conversation.members.some((id) => id.equals(userObjectId))) {
      throw new HttpException(403, "You are not a member of this conversation");
    }

    if (!dto.text || !dto.text.trim()) {
      throw new HttpException(400, "Message text is required");
    }

    const message = await MessageModel.create({
      conversation: conversationObjectId,
      from: userObjectId,
      to: dto.to ? new mongoose.Types.ObjectId(dto.to) : null,
      text: dto.text,
      read: false,
      deletedBy: [],
    });

    // update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return message;
  }

  /**
   * Lấy messages theo conversation (pagination)
   */
  public async getMessages(
    userId: string,
    conversationId: string,
    page = 1,
    limit = 20
  ): Promise<IMessage[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversation = await ConversationSchema.findById(conversationId);
    if (!conversation) {
      throw new HttpException(404, "Conversation not found");
    }

    if (!conversation.members.some((id) => id.equals(userObjectId))) {
      throw new HttpException(403, "No permission");
    }

    return MessageModel.find({
      conversation: conversation._id,
      deletedBy: { $ne: userObjectId },
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  /**
   * Đánh dấu message đã đọc
   */
  public async markAsRead(
    userId: string,
    messageId: string
  ): Promise<IMessage> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const message = await MessageModel.findById(messageId);
    if (!message) {
      throw new HttpException(404, "Message not found");
    }

    const conversation = await ConversationSchema.findById(
      message.conversation
    );
    if (!conversation) {
      throw new HttpException(404, "Conversation not found");
    }

    if (!conversation.members.some((id) => id.equals(userObjectId))) {
      throw new HttpException(403, "No permission");
    }

    if (!message.read) {
      message.read = true;
      await message.save();
    }

    return message;
  }

  /**
   * Xoá message cho riêng user (soft delete)
   */
  public async deleteMessageForMe(
    userId: string,
    messageId: string
  ): Promise<IMessage> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const message = await MessageModel.findById(messageId);
    if (!message) {
      throw new HttpException(404, "Message not found");
    }

    if (!message.deletedBy.some((id) => id.equals(userObjectId))) {
      message.deletedBy.push(userObjectId);
      await message.save();
    }

    return message;
  }
}
