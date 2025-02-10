import { HttpException, HttpStatus } from "@nestjs/common";

export class ZoneAlreadyExistsException extends HttpException {
    constructor() {
        super("Zone already exists", HttpStatus.BAD_REQUEST);
    }
}