import { IsMongoId, IsNotEmpty } from "class-validator";

export default class SendMessageDto {
  @IsMongoId()
  conversationId!: string;

  @IsNotEmpty()
  text!: string;
}
