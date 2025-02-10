import { HttpException, HttpStatus } from "@nestjs/common";

export class SpecieCanNotDeleteException extends HttpException {
    constructor(id: string) {
        super('Specie can not delete, because it is haves animals. Id: ' + id, HttpStatus.CONFLICT);
    }
}