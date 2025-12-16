import { Types } from "mongoose";
import { HttpException } from "@core/exceptions";
import GroupModel from "./groups.model";
import CreateGroupDto from "./dtos/create_group.dto";
import UpdateGroupDto from "./dtos/update_group.dto";
import { IGroup } from "./groups.interface";

class GroupsService {
  /**
   * CREATE GROUP
   * - Người tạo = creator
   * - Người tạo tự động:
   *   + là admin (manager)
   *   + là member
   */
  public async createGroup(userId: string, data: CreateGroupDto) {
    // 🔎 Check code trùng
    const existingGroup = await GroupModel.findOne({
      code: data.code,
    }).exec();

    if (existingGroup) {
      throw new HttpException(400, "Group code already exists");
    }

    const userObjectId = new Types.ObjectId(userId);

    const group = await GroupModel.create({
      name: data.name,
      code: data.code,
      description: data.description,

      creator: userObjectId,

      // Creator = admin
      managers: [
        {
          user: userObjectId,
          role: "admin",
        },
      ],

      // Creator = member
      members: [
        {
          user: userObjectId,
        },
      ],
    });

    return group;
  }

  /**
   * GET ALL GROUPS
   * - Dùng cho browse / discover group
   */
  public async getAllGroups() {
    const groups = await GroupModel.find()
      .populate("creator", ["first_name", "last_name", "avatar"])
      .populate("managers.user", ["first_name", "last_name", "avatar"])
      .populate("members.user", ["first_name", "last_name", "avatar"])
      .sort({ createdAt: -1 })
      .exec();

    return groups;
  }

  public async updateGroup(
    groupId: string,
    userId: string,
    data: UpdateGroupDto
  ): Promise<IGroup> {
    const group = await GroupModel.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    // ADMIN ONLY CHECK
    const isAdmin = group.managers.some(
      (m) => m.user.toString() === userId && m.role === "admin"
    );

    if (!isAdmin) {
      throw new HttpException(403, "Only group admin can update group");
    }

    // Check trùng name / code nếu có truyền
    if (data.name || data.code) {
      const existed = await GroupModel.findOne({
        _id: { $ne: groupId },
        $or: [
          ...(data.name ? [{ name: data.name }] : []),
          ...(data.code ? [{ code: data.code }] : []),
        ],
      }).exec();

      if (existed) {
        throw new HttpException(400, "Group name or code already exists");
      }
    }

    // Chỉ cho update các field an toàn
    const updateFields: Partial<IGroup> = {};

    if (data.name !== undefined) updateFields.name = data.name;
    if (data.code !== undefined) updateFields.code = data.code;
    if (data.description !== undefined) {
      updateFields.description = data.description;
    }

    const updatedGroup = await GroupModel.findByIdAndUpdate(
      groupId,
      { $set: updateFields },
      { new: true }
    ).exec();

    if (!updatedGroup) {
      throw new HttpException(400, "Update group failed");
    }

    return updatedGroup;
  }

  public async deleteGroup(groupId: string, userId: string): Promise<IGroup> {
    const group = await GroupModel.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    // 🔐 ADMIN ONLY CHECK
    const isAdmin = group.managers.some(
      (m) => m.user.toString() === userId && m.role === "admin"
    );

    if (!isAdmin) {
      throw new HttpException(403, "Only group admin can delete group");
    }

    const deletedGroup = await GroupModel.findByIdAndDelete(groupId).exec();

    if (!deletedGroup) {
      throw new HttpException(400, "Delete group failed");
    }

    return deletedGroup;
  }

  public async joinGroupByCode(userId: string, code: string): Promise<IGroup> {
    const group = await GroupModel.findOne({ code }).exec();

    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    const userObjectId = new Types.ObjectId(userId);

    // ❌ Đã là member
    const isMember = group.members.some((m) => m.user.toString() === userId);

    if (isMember) {
      throw new HttpException(400, "You are already a member of this group");
    }

    // ❌ Đã gửi request rồi
    const hasRequested = group.memberRequests.some(
      (r) => r.user.toString() === userId
    );

    if (hasRequested) {
      throw new HttpException(400, "Join request already sent");
    }

    // ✅ Thêm vào danh sách chờ duyệt
    group.memberRequests.unshift({
      user: userObjectId,
      date: new Date(),
    });

    await group.save();

    return group;
  }

  public async approveJoinRequest(
    groupId: string,
    adminId: string,
    targetUserId: string
  ): Promise<IGroup> {
    const group = await GroupModel.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    // CHECK ADMIN (hoặc mod nếu bạn muốn)
    const isAdmin = group.managers.some(
      (m) =>
        m.user.toString() === adminId &&
        (m.role === "admin" || m.role === "mod")
    );

    if (!isAdmin) {
      throw new HttpException(403, "You are not allowed to approve requests");
    }

    // User chưa gửi request
    const requestIndex = group.memberRequests.findIndex(
      (r) => r.user.toString() === targetUserId
    );

    if (requestIndex === -1) {
      throw new HttpException(400, "Join request not found");
    }

    // User đã là member (double check)
    const isMember = group.members.some(
      (m) => m.user.toString() === targetUserId
    );

    if (isMember) {
      throw new HttpException(400, "User is already a member");
    }

    // Remove request
    group.memberRequests.splice(requestIndex, 1);

    // Add to members
    group.members.unshift({
      user: new Types.ObjectId(targetUserId),
    });

    await group.save();

    return group;
  }

  public async rejectJoinRequest(
    groupId: string,
    adminId: string,
    targetUserId: string
  ): Promise<IGroup> {
    const group = await GroupModel.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    // CHECK ADMIN / MOD
    const isAllowed = group.managers.some(
      (m) =>
        m.user.toString() === adminId &&
        (m.role === "admin" || m.role === "mod")
    );

    if (!isAllowed) {
      throw new HttpException(403, "You are not allowed to reject requests");
    }

    //  User chưa gửi request
    const requestIndex = group.memberRequests.findIndex(
      (r) => r.user.toString() === targetUserId
    );

    if (requestIndex === -1) {
      throw new HttpException(400, "Join request not found");
    }

    //  Remove request
    group.memberRequests.splice(requestIndex, 1);

    await group.save();

    return group;
  }

  public async getPendingJoinRequests(groupId: string, requesterId: string) {
    const group = await GroupModel.findById(groupId)
      .populate("memberRequests.user", ["first_name", "last_name", "avatar"])
      .exec();

    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    // CHECK ADMIN / MOD
    const isAllowed = group.managers.some(
      (m) =>
        m.user.toString() === requesterId &&
        (m.role === "admin" || m.role === "mod")
    );

    if (!isAllowed) {
      throw new HttpException(
        403,
        "You are not allowed to view pending requests"
      );
    }

    return group.memberRequests;
  }

  public async leaveGroup(groupId: string, userId: string) {
    const group = await GroupModel.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    // Không phải member
    const isMember = group.members.some((m) => m.user.toString() === userId);

    if (!isMember) {
      throw new HttpException(400, "You are not a member of this group");
    }

    // Nếu là admin cuối cùng → không cho leave
    const adminCount = group.managers.filter((m) => m.role === "admin").length;

    const isAdmin = group.managers.some(
      (m) => m.user.toString() === userId && m.role === "admin"
    );

    if (isAdmin && adminCount === 1) {
      throw new HttpException(
        400,
        "You are the last admin, please assign another admin before leaving"
      );
    }

    // Remove khỏi members
    group.members = group.members.filter((m) => m.user.toString() !== userId);

    // Remove khỏi managers (nếu có)
    group.managers = group.managers.filter((m) => m.user.toString() !== userId);

    await group.save();

    return group;
  }

  public async kickMember(
    groupId: string,
    operatorId: string, // admin/mod thực hiện kick
    targetUserId: string
  ) {
    const group = await GroupModel.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    // Không được kick chính mình
    if (operatorId === targetUserId) {
      throw new HttpException(400, "You cannot kick yourself");
    }

    // Check quyền admin/mod
    const operator = group.managers.find(
      (m) => m.user.toString() === operatorId
    );

    if (!operator || (operator.role !== "admin" && operator.role !== "mod")) {
      throw new HttpException(403, "You are not allowed to kick members");
    }

    // Target không phải member
    const isMember = group.members.some(
      (m) => m.user.toString() === targetUserId
    );

    if (!isMember) {
      throw new HttpException(400, "Target user is not a member of this group");
    }

    // Mod không được kick admin
    const targetIsAdmin = group.managers.some(
      (m) => m.user.toString() === targetUserId && m.role === "admin"
    );

    if (operator.role === "mod" && targetIsAdmin) {
      throw new HttpException(403, "Moderator cannot kick an admin");
    }

    // Không cho kick admin cuối cùng
    const adminCount = group.managers.filter((m) => m.role === "admin").length;

    if (targetIsAdmin && adminCount === 1) {
      throw new HttpException(400, "Cannot kick the last admin of the group");
    }

    // Remove khỏi members
    group.members = group.members.filter(
      (m) => m.user.toString() !== targetUserId
    );

    // Remove khỏi managers (nếu có)
    group.managers = group.managers.filter(
      (m) => m.user.toString() !== targetUserId
    );

    await group.save();

    return group;
  }

  public async assignAdmin(
    groupId: string,
    operatorId: string, // admin hiện tại
    targetUserId: string
  ) {
    const group = await GroupModel.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    // Operator phải là admin
    const operatorIsAdmin = group.managers.some(
      (m) => m.user.toString() === operatorId && m.role === "admin"
    );

    if (!operatorIsAdmin) {
      throw new HttpException(403, "Only admin can assign admin");
    }

    // Target phải là member
    const isMember = group.members.some(
      (m) => m.user.toString() === targetUserId
    );

    if (!isMember) {
      throw new HttpException(400, "Target user is not a member");
    }

    // Target đã là admin
    const targetIsAdmin = group.managers.some(
      (m) => m.user.toString() === targetUserId && m.role === "admin"
    );

    if (targetIsAdmin) {
      throw new HttpException(400, "User is already an admin");
    }

    // Nếu đang là mod → remove mod
    group.managers = group.managers.filter(
      (m) => m.user.toString() !== targetUserId
    );

    // ✅ Add admin
    group.managers.unshift({
      user: new Types.ObjectId(targetUserId),
      role: "admin",
    });

    await group.save();
    return group;
  }

  public async assignMod(
    groupId: string,
    operatorId: string, // admin
    targetUserId: string
  ) {
    const group = await GroupModel.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    // 🔐 Operator phải là admin
    const operatorIsAdmin = group.managers.some(
      (m) => m.user.toString() === operatorId && m.role === "admin"
    );

    if (!operatorIsAdmin) {
      throw new HttpException(403, "Only admin can assign moderator");
    }

    // ❌ Target phải là member
    const isMember = group.members.some(
      (m) => m.user.toString() === targetUserId
    );

    if (!isMember) {
      throw new HttpException(400, "Target user is not a member");
    }

    // ❌ Target đã là mod hoặc admin
    const alreadyManager = group.managers.some(
      (m) => m.user.toString() === targetUserId
    );

    if (alreadyManager) {
      throw new HttpException(400, "User is already admin or moderator");
    }

    // Add mod
    group.managers.unshift({
      user: new Types.ObjectId(targetUserId),
      role: "mod",
    });

    await group.save();
    return group;
  }

  public async demoteAdmin(
    groupId: string,
    operatorId: string, // admin thao tác
    targetUserId: string
  ) {
    const group = await GroupModel.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    // Operator phải là admin
    const operatorIsAdmin = group.managers.some(
      (m) => m.user.toString() === operatorId && m.role === "admin"
    );

    if (!operatorIsAdmin) {
      throw new HttpException(403, "Only admin can demote admin");
    }

    // Không cho tự hạ quyền
    if (operatorId === targetUserId) {
      throw new HttpException(400, "You cannot demote yourself");
    }

    // Target phải là admin
    const targetIndex = group.managers.findIndex(
      (m) => m.user.toString() === targetUserId && m.role === "admin"
    );

    if (targetIndex === -1) {
      throw new HttpException(400, "Target user is not an admin");
    }

    // Không cho hạ admin cuối cùng
    const adminCount = group.managers.filter((m) => m.role === "admin").length;

    if (adminCount === 1) {
      throw new HttpException(400, "Cannot demote the last admin of the group");
    }

    // Remove admin role (về member thường)
    group.managers.splice(targetIndex, 1);

    await group.save();
    return group;
  }

  public async removeMod(
    groupId: string,
    operatorId: string, // admin
    targetUserId: string
  ) {
    const group = await GroupModel.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    // 🔐 Operator phải là admin
    const operatorIsAdmin = group.managers.some(
      (m) => m.user.toString() === operatorId && m.role === "admin"
    );

    if (!operatorIsAdmin) {
      throw new HttpException(403, "Only admin can remove moderator");
    }

    //  Target phải là mod
    const targetIndex = group.managers.findIndex(
      (m) => m.user.toString() === targetUserId && m.role === "mod"
    );

    if (targetIndex === -1) {
      throw new HttpException(400, "Target user is not a moderator");
    }

    // Remove mod role
    group.managers.splice(targetIndex, 1);

    await group.save();
    return group;
  }

  public async getGroupDetail(groupId: string, userId?: string) {
    const group = await GroupModel.findById(groupId)
      .populate("creator", ["first_name", "last_name", "avatar"])
      .populate("managers.user", ["first_name", "last_name", "avatar"])
      .populate("members.user", ["first_name", "last_name", "avatar"])
      .populate("memberRequests.user", ["first_name", "last_name", "avatar"])
      .exec();

    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    // ===== PUBLIC VIEW =====
    if (!userId) {
      return {
        _id: group._id,
        name: group.name,
        code: group.code,
        description: group.description,
        creator: group.creator,
        memberCount: group.members.length,
        createdAt: group.createdAt,
      };
    }

    const isMember = group.members.some(
      (m) => m.user._id.toString() === userId
    );

    const isAdmin = group.managers.some(
      (m) => m.user._id.toString() === userId && m.role === "admin"
    );

    // ===== MEMBER VIEW =====
    if (isMember && !isAdmin) {
      return {
        ...group.toObject(),
        memberRequests: undefined, // ẩn
      };
    }

    // ===== ADMIN VIEW =====
    if (isAdmin) {
      return group;
    }

    // ===== USER KHÔNG PHẢI MEMBER =====
    return {
      _id: group._id,
      name: group.name,
      description: group.description,
      creator: group.creator,
      memberCount: group.members.length,
    };
  }
}

export default GroupsService;
