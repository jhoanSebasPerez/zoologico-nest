export class CommentDetailProjectionDto {
    id: string;
    content: string;
    createdAt: Date;
    lastModifiedAt: Date;
    author: {
        id: string;
        name: string;
    };
    replies: {
        id: string;
        content: string;
    }[];
}