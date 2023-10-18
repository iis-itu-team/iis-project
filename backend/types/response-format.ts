import { PaginationMeta } from "./pagination"

export type PaginationResult<T> = {
    data: T[],
    pagination: PaginationMeta
}

export type ResponseFormat = Partial<{
    data: any | null
    status: string
    error: any
    count: number
    pagination: PaginationMeta
}>
