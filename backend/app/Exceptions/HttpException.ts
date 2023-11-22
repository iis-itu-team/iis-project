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
    public readonly error?: any
    public readonly statusCode: string
    public readonly data?: any

    constructor(httpStatus: number = 500, statusCode?: string, error?: any, data?: any) {
        super(`A failure with status ${statusCode} returned.`, httpStatus, 'FAILURE')
        
        this.error = error;
        this.statusCode = statusCode ?? "fail";
        this.data = data;
    }

    public static notFound(name: string, id: string) {
        return new HttpException(404, `${name}_not_found`, {
            [`${name}Id`]: id
        })
    }
}   
