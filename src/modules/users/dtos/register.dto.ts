import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export default class RegisterDto {
  @IsNotEmpty()
  public first_name!: string;

  @IsNotEmpty()
  public last_name!: string;

  @IsNotEmpty()
  @IsEmail()
  public email!: string;

  @IsNotEmpty()
  @MinLength(6)
  public password!: string;
}
