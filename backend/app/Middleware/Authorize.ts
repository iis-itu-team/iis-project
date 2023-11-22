import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Role } from "types/role";

export default class Authorize {
  public async handle({ request, response, auth }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const user = request.all()
    if (auth.isLoggedIn == false) {
      response.unauthorized({ error: 'Must be logged in' })
      return
    }

    if (user.role != Role.ADMIN) {
      response.unauthorized({ error: 'User must be an Admin' })
      return
    }

    await next()
  }
}
