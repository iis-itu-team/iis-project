/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    if (error.code === 'FAILURE') {
      ctx.response.fail(error.status, {
        status: error.statusCode,
        error: error.error,
        data: error.data
      })
      return
    }

    if (error.code === 'E_VALIDATION_FAILURE') {
      ctx.response.fail("validation_fail", {
        data: error.messages.errors
      })
      return
    }

    return super.handle(error, ctx)
  }
}
