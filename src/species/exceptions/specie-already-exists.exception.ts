import { HttpException, HttpStatus } from "@nestjs/common";

export class SpecieAlreadyExistsException extends HttpException {
    constructor(name) {
        super(`Specie with name ${name} already exists`, HttpStatus.CONFLICT);
    }
}