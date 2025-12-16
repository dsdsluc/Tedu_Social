import { Router } from "express";
import { Route } from "@core/interfaces";
import ConversationController from "./conversations.controller";
import authMiddleware from "@core/middleware/auth.middleware";

export default class ConversationsRoute implements Route {
  public path = "/api/v1/conversations";
  public router = Router();
  private conversationController = new ConversationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /api/conversations
    this.router.get(
      "/",
      authMiddleware,
      this.conversationController.getMyConversations
    );

    // POST /api/conversations/private
    this.router.post(
      "/private",
      authMiddleware,
      this.conversationController.createPrivateConversation
    );

    // POST /api/conversations/group
    this.router.post(
      "/group",
      authMiddleware,
      this.conversationController.createGroupConversation
    );

    // PATCH /api/conversations/:id/archive
    this.router.patch(
      "/:id/archive",
      authMiddleware,
      this.conversationController.archiveConversation
    );
  }
}
