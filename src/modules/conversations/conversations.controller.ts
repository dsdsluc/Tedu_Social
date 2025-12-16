import { Request, Response, NextFunction } from "express";
import ConversationService from "./conversations.service";

export default class ConversationController {
  private conversationService = new ConversationService();

  /**
   * GET /conversations
   */
  public getMyConversations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: userId } = req.user!;

      const conversations = await this.conversationService.getMyConversations(
        userId
      );

      res.status(200).json(conversations);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /conversations/private
   */
  public createPrivateConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: userId } = req.user!;
      const { targetUserId } = req.body;

      const conversation =
        await this.conversationService.createPrivateConversation(
          userId,
          targetUserId
        );

      res.status(201).json(conversation);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /conversations/group
   */
  public createGroupConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: userId } = req.user!;
      const { members, groupId } = req.body;

      const conversation =
        await this.conversationService.createGroupConversation(
          userId,
          members,
          groupId
        );

      res.status(201).json(conversation);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /conversations/:id/archive
   */
  public archiveConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: userId } = req.user!;
      const { id: conversationId } = req.params;

      const conversation = await this.conversationService.archiveConversation(
        userId,
        conversationId
      );

      res.status(200).json(conversation);
    } catch (error) {
      next(error);
    }
  };
}
