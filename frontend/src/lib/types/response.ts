export interface ResponseFormat<T> {
    status: string;
    data?: T;
    pagination?: {
        perPage: number,
        lastPage: number,
        firstPage: number,
        currentPage: number,
    }
    error?: any;
    count?: number;
}
