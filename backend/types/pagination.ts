import { schema, rules } from "@ioc:Adonis/Core/Validator"

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

export const paginationSchema = {
    perPage: schema.number.optional([
        rules.unsigned(),
    ]),
    page: schema.number.optional([
        rules.unsigned()
    ]),
}
