import { Router } from "express";
import { Route } from "@core/interfaces";
import authMiddleware from "@core/middleware/auth.middleware";
import MessagesController from "./messages.controller";

export default class MessagesRoute implements Route {
  public path = "/api/v1/messages";
  public router = Router();
  private messagesController = new MessagesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * POST /api/messages
     * Gửi message
     */
    this.router.post("/", authMiddleware, this.messagesController.sendMessage);

    /**
     * GET /api/messages/:conversationId?page=1&limit=20
     * Lấy danh sách message theo conversation
     */
    this.router.get(
      "/:conversationId",
      authMiddleware,
      this.messagesController.getMessages
    );

    /**
     * PATCH /api/messages/:messageId/read
     * Đánh dấu message đã đọc
     */
    this.router.patch(
      "/:messageId/read",
      authMiddleware,
      this.messagesController.markAsRead
    );

    /**
     * DELETE /api/messages/:messageId
     * Xoá message cho riêng user (soft delete)
     */
    this.router.delete(
      "/:messageId",
      authMiddleware,
      this.messagesController.deleteMessageForMe
    );
  }
}
