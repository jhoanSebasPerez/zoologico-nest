import { Expose, Transform } from "class-transformer";

export class CommentResponseDto {
    @Expose()
    id: string;

    @Expose()
    content: string;

    @Expose()
    authorId: string;

    @Expose()
    authorName: string;

    @Expose()
    animalId: string;

    @Expose()
    animalName: string;

    @Expose()
    @Transform(({ obj }) => ({
        self: { method: 'GET', href: `/comments/${obj.id}` },
    }))
    links: object;

}