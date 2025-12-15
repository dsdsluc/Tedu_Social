import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import { HttpException } from "@core/exceptions";
import { isEmptyObject } from "@core/utils";

import LoginDto from "./auth.dto";

import IUser from "@modules/users/users.interface";
import { UserSchema } from "@modules/users";

import { TokenData } from "@modules/auth";
import { DataStoredInToken } from "@modules/auth/auth.interface";

class AuthService {
  public userSchema = UserSchema;

  public async login(model: LoginDto): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    const user = await this.userSchema.findOne({ email: model.email });
    if (!user) {
      throw new HttpException(409, `Your email ${model.email} is not exist.`);
    }

    const isMatchPassword = await bcryptjs.compare(
      model.password,
      user.password
    );

    if (!isMatchPassword) {
      throw new HttpException(400, "Credential is not valid");
    }

    return this.createToken(user);
  }

  //  GET CURRENT USER
  public async getCurrentUser(userId: string): Promise<IUser> {
    const user = await this.userSchema.findById(userId).select("-password");

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return user;
  }

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

export default AuthService;
