import { IsMongoId } from "class-validator";

export class CreatePrivateConversationDto {
  @IsMongoId()
  targetUserId!: string;
}
