import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export default class AddExperienceDto {
  @IsString()
  title!: string;

  @IsString()
  company!: string;

  @IsOptional()
  @IsString()
  location?: string;

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
