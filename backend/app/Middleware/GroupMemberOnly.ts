import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Group from 'App/Models/Group'
import { Role } from 'types/role'
import HttpException from 'App/Exceptions/HttpException'
import { GroupRole } from 'types/group-role'

// only group members can do this action
// requires group_id path param
// guards can include:
// - 'manage' - if provided, check for management perms (group admin / mod, user admin)
export default class GroupAuth {
    public async handle({ auth, request, response }: HttpContextContract, next: () => Promise<void>, guards?: string[]) {
        if (!auth.isLoggedIn) {
            throw new HttpException(500, "not_authed", "User has to be authed before MemberONly middleware.")
        }

        const user = auth.user!

        const groupId = request.param('group_id')

        // query group and membership of the user
        const group = await Group.query()
            .join('group_members', (query) => {
                query.on('groups.id', 'group_members.group_id')
                    .andOnVal('group_members.user_id', user.id)
            })
            .first()

        if (!group) {
            throw HttpException.notFound('group', groupId)
        }

        if (user.role !== Role.ADMIN && group.$extras.group_role === null) {
            response.status(401).fail('not_allowed', {
                error: "Members only."
            })
            return;
        }

        // require manage permissions
        // group admin / mod, user admin
        if (guards && guards.includes('manage')) {
            if (user.role !== Role.ADMIN &&
                group.$extras.group_role !== GroupRole.ADMIN &&
                group.$extras.group_role !== GroupRole.MOD) {

                response.status(401).fail('manage_not_allowed', {
                    error: "Not allowed to manage this group."
                })
                return;
            }
        }

        await next();
    }
}
