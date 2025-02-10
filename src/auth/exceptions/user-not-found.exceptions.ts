import { HttpException, HttpStatus } from "@nestjs/common";

export class UserNotFoundException extends HttpException {
    constructor(id: string) {
        super('User not found with id: ' + id, HttpStatus.NOT_FOUND);
    }
}