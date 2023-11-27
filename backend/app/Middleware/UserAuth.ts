import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Role } from 'types/role'
import HttpException from 'App/Exceptions/HttpException'

export default class UserAuth {
    public async handle({ auth, request }: HttpContextContract, next: () => Promise<void>) {
        if (!auth.isLoggedIn) {
            return
        }

        if (auth.user?.role == Role.ADMIN) {
            await next()
            return
        }

        const userId = request.param('user_id')

        if (userId === auth.user?.id) {
            await next()
            return
        }

        throw new HttpException(401, "not_allowed", "Not allowed to manage this user.");
    }
}
