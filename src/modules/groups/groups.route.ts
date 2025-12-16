import { Router } from "express";
import { Route } from "@core/interfaces";
import { authMiddleware, optionalAuthMiddleware } from "@core/middleware";
import validationMiddleware from "@core/middleware/validation.middleware";

import GroupsController from "./groups.controllers";
import CreateGroupDto from "./dtos/create_group.dto";
import UpdateGroupDto from "./dtos/update_group.dto";

export default class GroupsRoute implements Route {
  public path = "/api/v1/groups";
  public router = Router();
  private groupsController = new GroupsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // =========================
    // CREATE GROUP
    // =========================
    // POST /api/v1/groups
    this.router.post(
      "/",
      authMiddleware,
      validationMiddleware(CreateGroupDto),
      this.groupsController.createGroup
    );

    // =========================
    // GET ALL GROUPS
    // =========================
    // GET /api/v1/groups
    this.router.get("/", authMiddleware, this.groupsController.getAllGroups);

    // =========================
    // UPDATE GROUP
    // =========================
    // PUT /api/v1/groups/:groupId
    this.router.put(
      "/:groupId",
      authMiddleware,
      validationMiddleware(UpdateGroupDto),
      this.groupsController.updateGroup
    );

    // DELETE /api/v1/groups/:groupId
    this.router.delete(
      "/:groupId",
      authMiddleware,
      this.groupsController.deleteGroup
    );

    // =========================
    // JOIN GROUP BY CODE
    // =========================
    // POST /api/v1/groups/join
    this.router.post(
      "/join",
      authMiddleware,
      this.groupsController.joinGroupByCode
    );

    // =========================
    // APPROVE JOIN REQUEST
    // =========================
    // POST /api/v1/groups/:groupId/approve
    this.router.post(
      "/:groupId/approve",
      authMiddleware,
      this.groupsController.approveJoinRequest
    );

    // =========================
    // REJECT JOIN REQUEST
    // =========================
    // POST /api/v1/groups/:groupId/reject
    this.router.post(
      "/:groupId/reject",
      authMiddleware,
      this.groupsController.rejectJoinRequest
    );

    // =========================
    // GET PENDING JOIN REQUESTS
    // =========================
    // GET /api/v1/groups/:groupId/pending-requests
    this.router.get(
      "/:groupId/pending-requests",
      authMiddleware,
      this.groupsController.getPendingJoinRequests
    );

    // =========================
    // LEAVE GROUP
    // =========================
    // POST /api/v1/groups/:groupId/leave
    this.router.post(
      "/:groupId/leave",
      authMiddleware,
      this.groupsController.leaveGroup
    );

    // =========================
    // KICK MEMBER
    // =========================
    // POST /api/v1/groups/:groupId/kick
    this.router.post(
      "/:groupId/kick",
      authMiddleware,
      this.groupsController.kickMember
    );

    // =========================
    // ASSIGN ADMIN
    // =========================
    this.router.post(
      "/:groupId/assign-admin",
      authMiddleware,
      this.groupsController.assignAdmin
    );

    // =========================
    // ASSIGN MOD
    // =========================
    this.router.post(
      "/:groupId/assign-mod",
      authMiddleware,
      this.groupsController.assignMod
    );

    // =========================
    // DEMOTE ADMIN
    // =========================
    this.router.post(
      "/:groupId/demote-admin",
      authMiddleware,
      this.groupsController.demoteAdmin
    );

    // =========================
    // REMOVE MOD
    // =========================
    this.router.post(
      "/:groupId/remove-mod",
      authMiddleware,
      this.groupsController.removeMod
    );

    // GET GROUP DETAIL (public)
    this.router.get(
      "/:groupId",
      optionalAuthMiddleware,
      this.groupsController.getGroupDetail
    );
  }
}
