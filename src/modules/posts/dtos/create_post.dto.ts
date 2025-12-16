import { IsString, IsNotEmpty, MinLength } from "class-validator";

export default class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  public text!: string;
}
