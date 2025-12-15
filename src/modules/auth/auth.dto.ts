import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export default class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  public email!: string;

  @IsNotEmpty()
  @MinLength(6)
  public password!: string;
}
