import { IsNotEmpty, IsString } from "class-validator";

export default class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  public text!: string;
}
