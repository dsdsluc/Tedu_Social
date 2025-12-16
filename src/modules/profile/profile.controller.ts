import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import CreateProfileDto from "./dtos/create_profile.dto";
import { IProfile } from "./profile.interface";
import ProfileService from "./profile.service";
import { HttpException } from "@core/exceptions";
import AddExperienceDto from "./dtos/add_experience.dto";
import AddEducationDto from "./dtos/add_education.dto";

class ProfileController {
  private profileService = new ProfileService();

  // ==========================
  // GET CURRENT USER PROFILE
  // GET /api/v1/profile/me
  // ==========================
  public getCurrentProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new HttpException(401, "Unauthorized");
      }

      const userId = req.user.id;

      const profile = await this.profileService.getCurrentProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  // ==========================
  // GET PROFILE BY USER ID
  // GET /api/v1/profile/user/:id
  // ==========================
  public getByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new HttpException(400, "Invalid user id");
      }

      const profile: IProfile = await this.profileService.getProfileByUserId(
        id
      );

      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  // ==========================
  // GET ALL PROFILES
  // GET /api/v1/profile
  // ==========================
  public getAllProfiles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const profiles: IProfile[] = await this.profileService.getAllProfiles();

      res.status(200).json(profiles);
    } catch (error) {
      next(error);
    }
  };

  // ==========================
  // CREATE / UPDATE PROFILE
  // POST /api/v1/profile
  // ==========================
  public createProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new HttpException(401, "Unauthorized");
      }

      const userId = req.user.id;
      const dto: CreateProfileDto = req.body;

      const profile: IProfile = await this.profileService.createProfile(
        userId,
        dto
      );

      res.status(201).json(profile);
    } catch (error) {
      next(error);
    }
  };

  // ==========================
  // DELETE PROFILE
  // DELETE /api/v1/profile/:id
  // ==========================
  public deleteProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new HttpException(400, "Invalid user id");
      }

      await this.profileService.deleteProfile(id);

      res.status(200).json({ message: "Profile deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/profile/experience
   * Add experience to current user's profile
   */
  public createExperience = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;

      const data: AddExperienceDto = req.body;

      const profile: IProfile = await this.profileService.addExperience(
        userId,
        data
      );

      res.status(201).json(profile);
    } catch (error) {
      next(error);
    }
  };

  public deleteExperience = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { expId } = req.params;

      const profile = await this.profileService.deleteExperience(userId, expId);

      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };
  /**
   * PUT /api/v1/profile/education
   * Add education to current user's profile
   */
  public createEducation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const data: AddEducationDto = req.body;

      const profile: IProfile = await this.profileService.addEducation(
        userId,
        data
      );

      res.status(201).json(profile);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/profile/education/:eduId
   * Remove education from profile
   */
  public deleteEducation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { eduId } = req.params;

      const profile: IProfile = await this.profileService.deleteEducation(
        userId,
        eduId
      );

      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/profiles/:userId/follow
   * Follow a user profile
   */
  public follow = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const fromUserId = req.user!.id;
      const { userId } = req.params;

      const profile = await this.profileService.follow(fromUserId, userId);

      res.status(200).json({
        profile,
        followingsCount: profile.followings.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/profiles/:userId/unfollow
   * Unfollow a user profile
   */
  public unfollow = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const fromUserId = req.user!.id;
      const { userId } = req.params;

      const profile = await this.profileService.unfollow(fromUserId, userId);

      res.status(200).json({
        profile,
        followingsCount: profile.followings.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/profiles/:userId/friends/request
   * Send friend request
   */
  public addFriend = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const fromUserId = req.user!.id;
      const { userId } = req.params;

      const result = await this.profileService.addFriend(fromUserId, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/profiles/:userId/friends/accept
   * Accept friend request
   */
  public acceptFriendRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUserId = req.user!.id;
      const { userId } = req.params;

      const result = await this.profileService.acceptFriendRequest(
        currentUserId,
        userId
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/profiles/:userId/friends/reject
   * Reject friend request
   */
  public rejectFriendRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUserId = req.user!.id;
      const { userId } = req.params;

      const result = await this.profileService.rejectFriendRequest(
        currentUserId,
        userId
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/profiles/:userId/friends
   * Unfriend
   */
  public unfriend = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const fromUserId = req.user!.id;
      const { userId } = req.params;

      const result = await this.profileService.unfriend(fromUserId, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default ProfileController;
