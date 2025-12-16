import { Router } from "express";
import { Route } from "@core/interfaces";
import { authMiddleware, validationMiddleware } from "@core/middleware";

import ProfileController from "./profile.controller";
import CreateProfileDto from "./dtos/create_profile.dto";
import AddExperienceDto from "./dtos/add_experience.dto";
import AddEducationDto from "./dtos/add_education.dto";

class ProfileRoute implements Route {
  public path = "/api/v1/profile";
  public router = Router();
  private profileController = new ProfileController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /*
     * ==========================
     * PROFILE APIs
     * Base URL: /api/v1/profile
     * ==========================
     */

    // GET /api/v1/profile
    this.router.get("/", this.profileController.getAllProfiles);

    // GET /api/v1/profile/me
    this.router.get(
      "/me",
      authMiddleware,
      this.profileController.getCurrentProfile
    );

    // GET /api/v1/profile/user/:id
    this.router.get("/user/:id", this.profileController.getByUserId);

    // POST /api/v1/profile
    this.router.post(
      "/",
      authMiddleware,
      validationMiddleware(CreateProfileDto),
      this.profileController.createProfile
    );

    // DELETE /api/v1/profile/:id
    this.router.delete(
      "/:id",
      authMiddleware,
      this.profileController.deleteProfile
    );

    this.router.put(
      "/experience",
      authMiddleware,
      validationMiddleware(AddExperienceDto),
      this.profileController.createExperience
    );

    this.router.delete(
      "/experience/:expId",
      authMiddleware,
      this.profileController.deleteExperience
    );

    // PUT /api/v1/profile/education
    this.router.put(
      "/education",
      authMiddleware,
      validationMiddleware(AddEducationDto),
      this.profileController.createEducation
    );

    // DELETE /api/v1/profile/education/:eduId
    this.router.delete(
      "/education/:eduId",
      authMiddleware,
      this.profileController.deleteEducation
    );

    // FOLLOW
    this.router.put(
      "/:userId/follow",
      authMiddleware,
      this.profileController.follow
    );

    // UNFOLLOW
    this.router.put(
      "/:userId/unfollow",
      authMiddleware,
      this.profileController.unfollow
    );

    // =========================
    // FRIEND SYSTEM
    // =========================

    // Send friend request
    this.router.post(
      "/:userId/friends/request",
      authMiddleware,
      this.profileController.addFriend
    );

    // Accept friend request
    this.router.post(
      "/:userId/friends/accept",
      authMiddleware,
      this.profileController.acceptFriendRequest
    );

    // Reject friend request
    this.router.post(
      "/:userId/friends/reject",
      authMiddleware,
      this.profileController.rejectFriendRequest
    );

    // Unfriend
    this.router.delete(
      "/:userId/friends",
      authMiddleware,
      this.profileController.unfriend
    );
  }
}

export default ProfileRoute;
