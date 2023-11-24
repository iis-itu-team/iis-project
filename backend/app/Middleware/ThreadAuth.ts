import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Visibility } from 'types/visibility'
import Group from 'App/Models/Group'
import Thread from 'App/Models/Thread'
import Database from '@ioc:Adonis/Lucid/Database'
import { Role } from 'types/role'

export default class ThreadAuth {
  // authorisation for /threads endpoint
  public async handle({ auth, request, response }: HttpContextContract, next: () => Promise<void>) {
    if (auth.isLoggedIn && auth.user?.role == Role.ADMIN) {
      await next()
      return
    }

    const thread = await Thread.query().select().where('thread.id', '=', request.param('id'))

    const groupId = thread.at(0)?.groupId ?? ''

    const group = await Group.query().select('visibility').where('groups.id', '=', groupId)

    // For debuggin purposes
    // console.log(request.param('id'))
    // console.log(request.param('group_id'))
    // console.log(groupId)
    if (!group.at(0)) {
      response.status(404).fail('group not found')
      return
    }

    const groupVisibility = group.at(0)?.visibility

    if (groupVisibility === Visibility.PUBLIC) {
      await next()
      return
    }

    if (groupVisibility === Visibility.PROTECTED) {
      if (!auth.isLoggedIn) {
        response.status(401).fail('log in to see the group')
        return
      }

      await next()
      return
    }

    if (groupVisibility === Visibility.PRIVATE) {
      if (!auth.isLoggedIn) {
        response.status(401).fail('log in to see the group')
        return
      }

      const members = await Database.from('group_members')
        .select('user_id')
        .where('group_id', '=', groupId)

      if (members.findIndex((member) => {return member?.user_id == auth.user?.id}) == -1) {
        response.status(403).fail('not a member of the group')
        return
      }

      await next()
      return
    }

    response.status(500).fail('internal server error: group-auth')
    return
  }
}
