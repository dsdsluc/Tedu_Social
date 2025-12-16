import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export default class AddEducationDto {
  @IsString()
  school!: string;

  @IsString()
  degree!: string;

  @IsString()
  fieldofstudy!: string;

  @IsDateString()
  from!: Date;

  @IsOptional()
  @IsDateString()
  to?: Date;

  @IsBoolean()
  current!: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
