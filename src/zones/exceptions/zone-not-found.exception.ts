import { HttpException, HttpStatus } from "@nestjs/common";

export class ZoneNotFoundException extends HttpException {
    constructor(id: string) {
        super(`Zone with id ${id} not found`, HttpStatus.NOT_FOUND);
    }
}