import { Request, Response, NextFunction } from "express";
import GroupsService from "./groups.service";
import CreateGroupDto from "./dtos/create_group.dto";
import UpdateGroupDto from "./dtos/update_group.dto";

export default class GroupsController {
  private groupsService = new GroupsService();

  /**
   * POST /api/v1/groups
   * Create new group
   */
  public createGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const data: CreateGroupDto = req.body;

      const group = await this.groupsService.createGroup(userId, data);

      res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/groups
   * Get all groups
   */
  public getAllGroups = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const groups = await this.groupsService.getAllGroups();

      res.status(200).json(groups);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/groups/:groupId
   * Update group (admin only – kiểm tra quyền sẽ làm ở service/middleware sau)
   */
  public updateGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const data: UpdateGroupDto = req.body;

      const userId = req.user!.id;

      const updatedGroup = await this.groupsService.updateGroup(
        groupId,
        userId,
        data
      );

      res.status(200).json(updatedGroup);
    } catch (error) {
      next(error);
    }
  };

  public deleteGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { groupId } = req.params;
      const userId = req.user!.id;

      const deletedGroup = await this.groupsService.deleteGroup(
        groupId,
        userId
      );

      res.status(200).json(deletedGroup);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/groups/join
   * Join group by code
   */
  public joinGroupByCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { code } = req.body;

      const group = await this.groupsService.joinGroupByCode(userId, code);

      res.status(200).json({
        message: "Join request sent, waiting for approval",
        group,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/groups/:groupId/approve
   * Approve join request
   */
  public approveJoinRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminId = req.user!.id;
      const { groupId } = req.params;
      const { userId } = req.body; // user cần duyệt

      const group = await this.groupsService.approveJoinRequest(
        groupId,
        adminId,
        userId
      );

      res.status(200).json({
        message: "Join request approved",
        group,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/groups/:groupId/reject
   * Reject join request
   */
  public rejectJoinRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminId = req.user!.id;
      const { groupId } = req.params;
      const { userId } = req.body; // user bị reject

      const group = await this.groupsService.rejectJoinRequest(
        groupId,
        adminId,
        userId
      );

      res.status(200).json({
        message: "Join request rejected",
        group,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/groups/:groupId/pending-requests
   * Get pending join requests (admin/mod only)
   */
  public getPendingJoinRequests = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requesterId = req.user!.id;
      const { groupId } = req.params;

      const pendingRequests = await this.groupsService.getPendingJoinRequests(
        groupId,
        requesterId
      );

      res.status(200).json(pendingRequests);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/groups/:groupId/leave
   * Leave group
   */
  public leaveGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      const group = await this.groupsService.leaveGroup(groupId, userId);

      res.status(200).json({
        message: "You have left the group",
        group,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/groups/:groupId/kick
   * Kick a member (admin/mod only)
   */
  public kickMember = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const operatorId = req.user!.id;
      const { groupId } = req.params;
      const { userId } = req.body; // user bị kick

      const group = await this.groupsService.kickMember(
        groupId,
        operatorId,
        userId
      );

      res.status(200).json({
        message: "Member has been kicked from the group",
        group,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/groups/:groupId/assign-admin
   */
  public assignAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const operatorId = req.user!.id;
      const { groupId } = req.params;
      const { userId } = req.body;

      const group = await this.groupsService.assignAdmin(
        groupId,
        operatorId,
        userId
      );

      res.status(200).json({
        message: "Admin assigned successfully",
        group,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/groups/:groupId/assign-mod
   */
  public assignMod = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const operatorId = req.user!.id;
      const { groupId } = req.params;
      const { userId } = req.body;

      const group = await this.groupsService.assignMod(
        groupId,
        operatorId,
        userId
      );

      res.status(200).json({
        message: "Moderator assigned successfully",
        group,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/groups/:groupId/demote-admin
   */
  public demoteAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const operatorId = req.user!.id;
      const { groupId } = req.params;
      const { userId } = req.body;

      const group = await this.groupsService.demoteAdmin(
        groupId,
        operatorId,
        userId
      );

      res.status(200).json({
        message: "Admin demoted successfully",
        group,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/groups/:groupId/remove-mod
   */
  public removeMod = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const operatorId = req.user!.id;
      const { groupId } = req.params;
      const { userId } = req.body;

      const group = await this.groupsService.removeMod(
        groupId,
        operatorId,
        userId
      );

      res.status(200).json({
        message: "Moderator removed successfully",
        group,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/groups/:groupId
   */
  public getGroupDetail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { groupId } = req.params;
      const userId = req.user?.id; // có thể undefined

      const group = await this.groupsService.getGroupDetail(groupId, userId);

      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  };
}
