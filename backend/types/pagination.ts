export type PaginationMeta = {
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
}

export type PaginationInput = {
    page?: number
    perPage?: number
}
