import { PaginationResult, ResponseFormat } from "types/response-format";

declare module '@ioc:Adonis/Core/Response' {
    interface ResponseContract {
        formatted(format: ResponseFormat): this
        success(data?: any): this
        list<T>(result: PaginationResult<T>): this
        fail(status: string, input?: ResponseFormat): this
    }
}