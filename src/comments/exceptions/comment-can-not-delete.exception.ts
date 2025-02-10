import { HttpException, HttpStatus } from "@nestjs/common";

export class CommentCanNotDeleteException extends HttpException {
    constructor(id: string) {
        super('Comment can not be deleted, because it is has children. ID: ' + id, HttpStatus.CONFLICT);
    }
}