export class CommentProjectionDto {
    id: string;
    content: string;
    countOfReplies: number;
    lastModifiedAt: Date;
    author: {
        id: string;
        name: string;
    };
}