import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Role } from "types/role";

export default class AdminOnly {
  // make sure that the authorized user is an administrator
  public async handle({ response, auth }: HttpContextContract, next: () => Promise<void>) {
    if (auth.isLoggedIn == false) {
      response.formatted({
        status: "unauthenticated",
        error: "You must be logged in for this route."
      });
      return;
    }

    if (auth.user?.role != Role.ADMIN) {
      response.formatted({
        status: "not_admin",
        error: "You must be an admin."
      });
      return;
    }

    await next();
  }
}
