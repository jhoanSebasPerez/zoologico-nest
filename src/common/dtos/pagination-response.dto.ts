export class PaginationResponseDto<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;

    constructor(data: T[], total: number, page: number, totalPages: number) {
        this.data = data;
        this.total = total;
        this.page = page;
        this.totalPages = totalPages;
    }

}