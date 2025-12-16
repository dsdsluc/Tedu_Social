import bcryptjs from "bcryptjs";
import gravatar from "gravatar";
import jwt from "jsonwebtoken";

import { HttpException } from "@core/exceptions";
import { isEmptyObject } from "@core/utils";

import IUser from "./users.interface";
import RegisterDto from "./dtos/register.dto";
import UserSchema from "./users.model";

import { DataStoredInToken } from "@modules/auth/auth.interface";
import { TokenData } from "@modules/auth";
import IPagination from "@core/interfaces/pagination.interface";

class UserService {
  public userSchema = UserSchema;

  // ==========================
  // CREATE USER (REGISTER)
  // ==========================
  public async createUser(model: RegisterDto): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    const existingUser = await this.userSchema.findOne({
      email: model.email,
    });

    if (existingUser) {
      throw new HttpException(409, `Your email ${model.email} already exists.`);
    }

    // Avatar mặc định
    const avatar = gravatar.url(model.email!, {
      size: "200",
      rating: "g",
      default: "mm",
    });

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(model.password!, salt);

    // Create user
    const createdUser = await this.userSchema.create({
      ...model,
      password: hashedPassword,
      avatar,
      date: new Date(),
    });

    // Return JWT token
    return this.createToken(createdUser);
  }

  // ==========================
  // UPDATE USER
  // ==========================

  public async updateUser(
    userId: string,
    model: Partial<RegisterDto>
  ): Promise<IUser> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    const user = await this.userSchema.findById(userId).exec();
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    // Check email trùng
    if (model.email && model.email !== user.email) {
      const emailExists = await this.userSchema.findOne({
        email: model.email,
        _id: { $ne: userId },
      });

      if (emailExists) {
        throw new HttpException(409, "Email already exists");
      }
    }

    // Update avatar nếu đổi email
    let avatar = user.avatar;
    if (model.email) {
      avatar = gravatar.url(model.email, {
        size: "200",
        rating: "g",
        default: "mm",
      });
    }

    // Hash password nếu có
    if (model.password) {
      const salt = await bcryptjs.genSalt(10);
      model.password = await bcryptjs.hash(model.password, salt);
    }

    const updatedUser = await this.userSchema
      .findByIdAndUpdate(userId, { ...model, avatar }, { new: true })
      .select("-password")
      .exec();

    if (!updatedUser) {
      throw new HttpException(409, "Update failed");
    }

    return updatedUser;
  }

  // ==========================
  // GET USER BY ID
  // ==========================

  public async getUserById(userId: string): Promise<IUser> {
    if (!userId) {
      throw new HttpException(400, "UserId is required");
    }

    const user = await this.userSchema
      .findById(userId)
      .select("-password")
      .exec();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return user;
  }

  public async getAll(): Promise<IUser[]> {
    return this.userSchema.find().select("-password").sort({ date: -1 }).exec();
  }

  public async getAllPaging(
    keyword: string,
    page = 1
  ): Promise<IPagination<IUser>> {
    const pageSize = Number(process.env.PAGE_SIZE || 10);

    const filter: any = {};

    if (keyword) {
      filter.$or = [
        { email: { $regex: keyword, $options: "i" } },
        { first_name: { $regex: keyword, $options: "i" } },
        { last_name: { $regex: keyword, $options: "i" } },
      ];
    }

    const users = await this.userSchema
      .find(filter)
      .select("-password")
      .sort({ date: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const total = await this.userSchema.countDocuments(filter);

    return {
      total,
      page,
      pageSize,
      items: users,
    };
  }

  // ==========================
  // SOFT DELETE USER
  // ==========================
  public async deleteUser(userId: string): Promise<IUser> {
    const user = await this.userSchema.findById(userId).exec();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    user.isDeleted = true;
    user.deletedAt = new Date();

    await user.save();
    return user;
  }
  // ==========================
  // RESTORE USER
  // ==========================

  public async restoreUser(userId: string): Promise<IUser> {
    const user = await this.userSchema.findById(userId).exec();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    user.isDeleted = false;
    user.deletedAt = null;

    await user.save();
    return user;
  }

  // ==========================
  // CREATE JWT TOKEN
  // ==========================
  private createToken(user: IUser): TokenData {
    const payload: DataStoredInToken = {
      id: user._id.toString(),
    };

    const secret = process.env.JWT_TOKEN_SECRET;
    if (!secret) {
      throw new Error("JWT_TOKEN_SECRET is not defined");
    }

    const expiresIn = 60 * 60;

    return {
      token: jwt.sign(payload, secret, { expiresIn }),
    };
  }
}

export default UserService;
