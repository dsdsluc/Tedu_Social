import {
  IEducation,
  IExperience,
  IProfile,
  ISocial,
} from "./profile.interface";
import { IUser, UserSchema } from "@modules/users";

import CreateProfileDto from "./dtos/create_profile.dto";
import { HttpException } from "@core/exceptions";
import ProfileSchema from "./profile.model";
import normalize from "normalize-url";
import AddExperienceDto from "./dtos/add_experience.dto";
import { Types } from "mongoose";
import AddEducationDto from "./dtos/add_education.dto";

class ProfileService {
  public async getCurrentProfile(userId: string): Promise<IProfile> {
    const profile = await ProfileSchema.findOne({ user: userId })
      .populate("user", ["first_name", "last_name", "avatar"])
      .exec();

    if (!profile) {
      throw new HttpException(404, "There is no profile for this user");
    }

    return profile;
  }

  public async createProfile(
    userId: string,
    profileDto: CreateProfileDto
  ): Promise<IProfile> {
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = profileDto;

    const profileFields: Partial<IProfile> = {
      user: userId as any,
      company,
      location,
      website: website ? normalize(website, { forceHttps: true }) : undefined,
      bio,
      skills,
      status,
    };

    const social: any = {};
    if (youtube) social.youtube = normalize(youtube, { forceHttps: true });
    if (twitter) social.twitter = normalize(twitter, { forceHttps: true });
    if (instagram)
      social.instagram = normalize(instagram, { forceHttps: true });
    if (linkedin) social.linkedin = normalize(linkedin, { forceHttps: true });
    if (facebook) social.facebook = normalize(facebook, { forceHttps: true });

    if (Object.keys(social).length > 0) {
      profileFields.social = social;
    }

    const profile = await ProfileSchema.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true, upsert: true }
    ).exec();

    return profile;
  }

  public async deleteProfile(userId: string): Promise<void> {
    const profile = await ProfileSchema.findOneAndDelete({
      user: userId,
    }).exec();

    if (!profile) {
      throw new HttpException(404, "Profile not found");
    }
  }

  public async getProfileByUserId(userId: string): Promise<IProfile> {
    const profile = await ProfileSchema.findOne({ user: userId })
      .populate("user", ["first_name", "last_name", "avatar"])
      .exec();

    if (!profile) {
      throw new HttpException(404, "Profile not found");
    }

    return profile;
  }

  public async getAllProfiles(): Promise<IProfile[]> {
    return ProfileSchema.find()
      .populate("user", ["first_name", "last_name", "avatar"])
      .exec();
  }

  public addExperience = async (
    userId: string,
    experience: AddExperienceDto
  ) => {
    const profile = await ProfileSchema.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!profile) {
      throw new HttpException(400, "There is no profile for this user");
    }

    const newExperience: IExperience = {
      ...experience,
      current: experience.current ?? false,
    };

    profile.experience.unshift(newExperience);
    await profile.save();

    return profile;
  };

  public deleteExperience = async (userId: string, experienceId: string) => {
    const profile = await ProfileSchema.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!profile) {
      throw new HttpException(400, "There is no profile for this user");
    }

    const experience = profile.experience.id(experienceId);

    if (!experience) {
      throw new HttpException(404, "Experience not found");
    }

    experience.deleteOne();

    await profile.save();

    return profile;
  };

  public addEducation = async (userId: string, education: AddEducationDto) => {
    const profile = await ProfileSchema.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!profile) {
      throw new HttpException(400, "There is no profile for this user");
    }

    const newEducation: IEducation = {
      ...education,
      current: education.current ?? false,
    };

    profile.education.unshift(newEducation);
    await profile.save();

    return profile;
  };

  public deleteEducation = async (userId: string, educationId: string) => {
    const profile = await ProfileSchema.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!profile) {
      throw new HttpException(400, "There is no profile for this user");
    }

    const education = profile.education.id(educationId);

    if (!education) {
      throw new HttpException(404, "Education not found");
    }

    education.deleteOne(); // mongoose >= 6
    await profile.save();

    return profile;
  };

  public async follow(fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId) {
      throw new HttpException(400, "You cannot follow yourself");
    }

    const fromProfile = await ProfileSchema.findOne({
      user: new Types.ObjectId(fromUserId),
    }).exec();

    if (!fromProfile) {
      throw new HttpException(404, "Profile of current user not found");
    }

    const toProfile = await ProfileSchema.findOne({
      user: new Types.ObjectId(toUserId),
    }).exec();

    if (!toProfile) {
      throw new HttpException(404, "Profile of target user not found");
    }

    const fromObjectId = new Types.ObjectId(fromUserId);
    const toObjectId = new Types.ObjectId(toUserId);

    const isFollowing = fromProfile.followings.some((f) =>
      f.user.equals(toObjectId)
    );

    if (isFollowing) {
      throw new HttpException(400, "You have already followed this user");
    }

    fromProfile.followings.unshift({ user: toObjectId });
    toProfile.followers.unshift({ user: fromObjectId });

    await fromProfile.save();
    await toProfile.save();

    return fromProfile;
  }

  public async unfollow(fromUserId: string, toUserId: string) {
    // Không cho unfollow chính mình
    if (fromUserId === toUserId) {
      throw new HttpException(400, "You cannot unfollow yourself");
    }

    // Profile của người đang unfollow
    const fromProfile = await ProfileSchema.findOne({
      user: new Types.ObjectId(fromUserId),
    }).exec();

    if (!fromProfile) {
      throw new HttpException(404, "Profile of current user not found");
    }

    // Profile của người bị unfollow
    const toProfile = await ProfileSchema.findOne({
      user: new Types.ObjectId(toUserId),
    }).exec();

    if (!toProfile) {
      throw new HttpException(404, "Profile of target user not found");
    }

    const fromObjectId = new Types.ObjectId(fromUserId);
    const toObjectId = new Types.ObjectId(toUserId);

    // Chưa follow thì không cho unfollow
    const isFollowing = fromProfile.followings.some((f) =>
      f.user.equals(toObjectId)
    );

    if (!isFollowing) {
      throw new HttpException(400, "You have not followed this user");
    }

    // Gỡ follow
    fromProfile.followings.pull({ user: toObjectId });
    toProfile.followers.pull({ user: fromObjectId });

    await fromProfile.save();
    await toProfile.save();

    return fromProfile;
  }

  public async addFriend(fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId) {
      throw new HttpException(400, "You cannot add yourself as friend");
    }

    const fromProfile = await ProfileSchema.findOne({
      user: new Types.ObjectId(fromUserId),
    }).exec();

    if (!fromProfile) {
      throw new HttpException(404, "Profile of current user not found");
    }

    const toProfile = await ProfileSchema.findOne({
      user: new Types.ObjectId(toUserId),
    }).exec();

    if (!toProfile) {
      throw new HttpException(404, "Profile of target user not found");
    }

    const fromObjectId = new Types.ObjectId(fromUserId);
    const toObjectId = new Types.ObjectId(toUserId);

    // Đã là bạn bè
    const isFriend = fromProfile.friends.some((f) => f.user.equals(toObjectId));

    if (isFriend) {
      throw new HttpException(400, "You are already friends");
    }

    // Đã gửi request trước đó
    const alreadySent = fromProfile.friendRequestsSent.some((r) =>
      r.user.equals(toObjectId)
    );

    if (alreadySent) {
      throw new HttpException(400, "Friend request already sent");
    }

    // Người kia đã gửi request cho mình
    const alreadyReceived = fromProfile.friendRequestsReceived.some((r) =>
      r.user.equals(toObjectId)
    );

    if (alreadyReceived) {
      throw new HttpException(
        400,
        "This user has already sent you a friend request"
      );
    }

    // Gửi request
    fromProfile.friendRequestsSent.unshift({ user: toObjectId });
    toProfile.friendRequestsReceived.unshift({ user: fromObjectId });

    await fromProfile.save();
    await toProfile.save();

    return {
      message: "Friend request sent successfully",
    };
  }

  public async unfriend(fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId) {
      throw new HttpException(400, "You cannot unfriend yourself");
    }

    const fromProfile = await ProfileSchema.findOne({
      user: new Types.ObjectId(fromUserId),
    }).exec();

    if (!fromProfile) {
      throw new HttpException(404, "Profile of current user not found");
    }

    const toProfile = await ProfileSchema.findOne({
      user: new Types.ObjectId(toUserId),
    }).exec();

    if (!toProfile) {
      throw new HttpException(404, "Profile of target user not found");
    }

    const fromObjectId = new Types.ObjectId(fromUserId);
    const toObjectId = new Types.ObjectId(toUserId);

    // Chưa phải bạn bè
    const isFriend = fromProfile.friends.some((f) => f.user.equals(toObjectId));

    if (!isFriend) {
      throw new HttpException(400, "You are not friends with this user");
    }

    // Gỡ bạn bè 2 chiều
    fromProfile.friends.pull({ user: toObjectId });
    toProfile.friends.pull({ user: fromObjectId });

    await fromProfile.save();
    await toProfile.save();

    return {
      message: "Unfriend successfully",
    };
  }

  public async acceptFriendRequest(currentUserId: string, fromUserId: string) {
    const currentProfile = await ProfileSchema.findOne({
      user: new Types.ObjectId(currentUserId),
    }).exec();

    if (!currentProfile) {
      throw new HttpException(404, "Profile of current user not found");
    }

    const fromProfile = await ProfileSchema.findOne({
      user: new Types.ObjectId(fromUserId),
    }).exec();

    if (!fromProfile) {
      throw new HttpException(404, "Profile of sender not found");
    }

    const currentObjectId = new Types.ObjectId(currentUserId);
    const fromObjectId = new Types.ObjectId(fromUserId);

    // Không có request
    const hasRequest = currentProfile.friendRequestsReceived.some((r) =>
      r.user.equals(fromObjectId)
    );

    if (!hasRequest) {
      throw new HttpException(400, "No friend request from this user");
    }

    // Đã là bạn bè
    const isFriend = currentProfile.friends.some((f) =>
      f.user.equals(fromObjectId)
    );

    if (isFriend) {
      throw new HttpException(400, "You are already friends");
    }

    // Xóa request
    currentProfile.friendRequestsReceived.pull({ user: fromObjectId });
    fromProfile.friendRequestsSent.pull({ user: currentObjectId });

    // Thêm bạn bè 2 chiều
    currentProfile.friends.unshift({ user: fromObjectId });
    fromProfile.friends.unshift({ user: currentObjectId });

    await currentProfile.save();
    await fromProfile.save();

    return {
      message: "Friend request accepted",
    };
  }

  public async rejectFriendRequest(currentUserId: string, fromUserId: string) {
    const currentProfile = await ProfileSchema.findOne({
      user: new Types.ObjectId(currentUserId),
    }).exec();

    if (!currentProfile) {
      throw new HttpException(404, "Profile of current user not found");
    }

    const fromProfile = await ProfileSchema.findOne({
      user: new Types.ObjectId(fromUserId),
    }).exec();

    if (!fromProfile) {
      throw new HttpException(404, "Profile of sender not found");
    }

    const currentObjectId = new Types.ObjectId(currentUserId);
    const fromObjectId = new Types.ObjectId(fromUserId);

    // Không có request
    const hasRequest = currentProfile.friendRequestsReceived.some((r) =>
      r.user.equals(fromObjectId)
    );

    if (!hasRequest) {
      throw new HttpException(400, "No friend request from this user");
    }

    //  Chỉ xóa request, KHÔNG thêm bạn
    currentProfile.friendRequestsReceived.pull({ user: fromObjectId });
    fromProfile.friendRequestsSent.pull({ user: currentObjectId });

    await currentProfile.save();
    await fromProfile.save();

    return {
      message: "Friend request rejected",
    };
  }
}

export default ProfileService;
