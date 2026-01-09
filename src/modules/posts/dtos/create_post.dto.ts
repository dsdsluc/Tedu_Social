import { IsString, IsNotEmpty, MinLength, IsOptional } from "class-validator";

export default class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  public text!: string;

  @IsOptional()
  public images?: string[];
}
