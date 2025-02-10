import { HttpException, HttpStatus } from "@nestjs/common";

export class ZoneCanNotDeleteException extends HttpException {
    constructor(id: string) {
        super('Zone can not be deleted, because it is has animals. ID: ' + id, HttpStatus.CONFLICT);
    }
}