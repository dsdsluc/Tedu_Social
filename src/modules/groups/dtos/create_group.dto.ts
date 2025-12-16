import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export default class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  public name!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 30)
  public code!: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  public description?: string;
}
