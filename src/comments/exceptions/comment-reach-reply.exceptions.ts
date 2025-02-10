import { HttpException, HttpStatus } from "@nestjs/common";

export class CommentReachReplyException extends HttpException {
    constructor() {
        super('Cannot reply to this comment. The maximum reply depth has been reached.', HttpStatus.CONFLICT);
    }
}