import { HttpException, HttpStatus } from "@nestjs/common";

export class AnimalAlreadyExistsException extends HttpException {
    constructor() {
        super('Animal with this name already exists', HttpStatus.CONFLICT);
    }
}