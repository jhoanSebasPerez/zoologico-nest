import { HttpException, HttpStatus } from "@nestjs/common";

export class SpecieNotFoundException extends HttpException {
    constructor(id: string) {
        super(`Specie with id ${id} not found`, HttpStatus.NOT_FOUND);
    }
}