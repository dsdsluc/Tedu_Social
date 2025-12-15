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

class UserService {
  public userSchema = UserSchema;

  // ==========================
  // CREATE USER (REGISTER)
  // ==========================
  public async createUser(model: RegisterDto): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    // 🔴 FIX QUAN TRỌNG: PHẢI await
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

    const expiresIn = 60 * 60; // 1 hour

    return {
      token: jwt.sign(payload, secret, { expiresIn }),
    };
  }
}

export default UserService;
