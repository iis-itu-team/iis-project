export interface ResponseFormat<T> {
    status: string;
    data?: T;
    error?: any;
}
