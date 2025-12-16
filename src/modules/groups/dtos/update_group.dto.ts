import { IsOptional, IsString, Length } from "class-validator";

export default class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;
}
