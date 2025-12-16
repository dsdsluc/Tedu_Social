import { Request, Response, NextFunction } from "express";
import MessagesService from "./messages.service";

export default class MessagesController {
  private messagesService = new MessagesService();

  /**
   * POST /api/messages
   * Gửi message
   */
  public sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: userId } = req.user!;
      const { conversationId, text, to } = req.body;

      const message = await this.messagesService.sendMessage(userId, {
        conversationId,
        text,
        to,
      });

      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/messages/:conversationId?page=1&limit=20
   * Lấy danh sách message theo conversation
   */
  public getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: userId } = req.user!;
      const { conversationId } = req.params;
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);

      const messages = await this.messagesService.getMessages(
        userId,
        conversationId,
        page,
        limit
      );

      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/messages/:messageId/read
   * Đánh dấu message đã đọc
   */
  public markAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: userId } = req.user!;
      const { messageId } = req.params;

      const message = await this.messagesService.markAsRead(userId, messageId);

      res.status(200).json(message);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/messages/:messageId
   * Xoá message cho riêng user (soft delete)
   */
  public deleteMessageForMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: userId } = req.user!;
      const { messageId } = req.params;

      const message = await this.messagesService.deleteMessageForMe(
        userId,
        messageId
      );

      res.status(200).json(message);
    } catch (error) {
      next(error);
    }
  };
}
