import { Exception } from '@adonisjs/core/build/standalone'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new HttpException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class HttpException extends Exception {
    public readonly data?: any
    public readonly error?: any
    public readonly statusCode: string

    constructor(httpStatus: number = 500, statusCode?: string, error?: any, data?: any) {
        super(`A failure with status ${statusCode} returned.`, httpStatus, 'E_HTTP_EXPECTED')
        
        this.error = error;
        this.data = data;
        this.statusCode = statusCode ?? "fail";
    }

    public static notFound(name: string, id: string) {
        return new HttpException(404, `${name}_not_found`, {
            [`${name}Id`]: id
        })
    }
}   
