import { IsOptional, IsString, IsNotEmpty } from "class-validator";

export default class UpdatePostDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public text?: string;
}
