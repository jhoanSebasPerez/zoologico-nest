import { Expose } from "class-transformer";

export class ReplyResponseDto {
    @Expose()
    id: string;

    @Expose()
    content: string;

    @Expose()
    authorId: string;

    @Expose()
    authorName: string;

    @Expose()
    replyTo: string;
}