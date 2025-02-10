import { Expose, Transform } from "class-transformer";

export class UpdateCommentResponseDto {
    @Expose()
    message: string;

    @Expose()
    content: string;

    @Expose()
    @Transform(({ obj }) => ({
        self: { method: 'GET', href: `/comments/${obj.id}` },
    }))
    links: object;
}