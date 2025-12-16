import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  ArrayNotEmpty,
} from "class-validator";

export default class CreateProfileDto {
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  // QUAN TRỌNG
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  skills!: string[];

  @IsString()
  status!: string;

  // ==========================
  // SOCIAL LINKS
  // ==========================
  @IsOptional()
  @IsUrl()
  youtube?: string;

  @IsOptional()
  @IsUrl()
  twitter?: string;

  @IsOptional()
  @IsUrl()
  instagram?: string;

  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  facebook?: string;
}
