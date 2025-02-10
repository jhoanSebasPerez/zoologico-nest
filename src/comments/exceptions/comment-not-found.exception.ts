import { HttpException, HttpStatus } from "@nestjs/common";

export class CommentNotFoundException extends HttpException {
    constructor(id: string) {
        super('Comment not found with id: ' + id, HttpStatus.NOT_FOUND);
    }
}