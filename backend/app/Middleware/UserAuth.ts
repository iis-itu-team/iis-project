import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Role } from 'types/role'
import HttpException from 'App/Exceptions/HttpException'
import User from 'App/Models/User'
import { Visibility } from 'types/visibility'

// guards:
// - manage - check for management perms (has to be admin or the user)
// - access - check visibility
export default class UserAuth {
    public async handle({ auth, request }: HttpContextContract, next: () => Promise<void>, guards?: string[]) {
        const userId = request.param('user_id')

        const currentUser = auth.user;

        if (currentUser && currentUser.role === Role.ADMIN || currentUser?.id === userId) {
            await next()
            return
        }

        // guest or logged in user, not admin, check visibility

        if (guards && guards.includes('access')) {
            const user = await User.find(userId)

            if (user?.visibility !== Visibility.PUBLIC &&
                (!currentUser || user?.visibility === Visibility.PROTECTED)) {
                throw new HttpException(401, "not_allowed", "Not allowed to view this user.");
            }
        }

        if (guards && guards.includes('manage')) {
            // not an admin or the user, would've passed by now
            throw new HttpException(401, "not_allowed", "Not allowed to manage this user.");
        }

        await next()
    }
}
