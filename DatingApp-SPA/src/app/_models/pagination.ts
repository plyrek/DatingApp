// An interface for storing our new pagination information from the API
export interface Pagination {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

// A class created to store ALL the information coming from the server
// both the Users and the Pagination info being returned in the header
export class PaginatedResult<T> {
    result: T;
    pagination: Pagination;
}
