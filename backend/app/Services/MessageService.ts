import { ExtractModelRelations } from "@ioc:Adonis/Lucid/Orm"
import HttpException from "App/Exceptions/HttpException"
import Group from "App/Models/Group"
import Message from "App/Models/Message"
import Thread from "App/Models/Thread"
import User from "App/Models/User"
import { PaginationInput } from "types/pagination"
import { ExpandInput } from "types/expand"
import Database from "@ioc:Adonis/Lucid/Database"
import { Visibility } from "types/visibility"
import { GroupRole } from "types/group-role"
import { Role } from "types/role"

export type CreateMessageInput = {
    threadId: string
    groupId: string
    ownerId: string
    content: string
}

export type UpdateMessageInput = {
    content: string
}

export type ListMessagesInput = {
    threadId: string
    groupId: string
    ownerId: string
} & PaginationInput & ExpandInput

export default class MessageService {
    public async listMessages({ ownerId, groupId, threadId, page, perPage, expand }: ListMessagesInput, currentUser?: User) {
        const q = Message.query()
            .leftJoin('groups', 'messages.group_id', 'groups.id')

        if (threadId) {
            q.where("thread_id", threadId)
        }

        if (groupId) {
            q.where("group_id", groupId)
        }

        if (ownerId) {
            q.where("owner_id", ownerId)
        }

        if (currentUser) {
            // only messages from groups the user can see into
            if (currentUser.role !== Role.ADMIN) {
                if (!groupId) {
                    q
                        // groups where he is a member
                        .whereIn('messages.group_id', Database.from('group_members')
                            .where('user_id', currentUser.id)
                            .whereNotNull('group_role')
                            .select('group_id')
                        )
                        // otherwise public / protected
                        .orWhereIn('groups.visibility', [Visibility.PUBLIC, Visibility.PROTECTED])
                }
            }

            // append a field with the info about his rating
            q.select("*", Database.from("user_ratings")
                .select("up")
                .whereRaw("user_ratings.message_id = messages.id")
                .where("user_ratings.user_id", currentUser.id)
                .as("user_rating")
            )
        } else {
            // only public groups if unauthed
            q.where('groups.visibility', Visibility.PUBLIC)
        }

        // preload expand fields
        expand.forEach((e) => q.preload(e as ExtractModelRelations<Message>));

        // Needs to be already sorted for correct pagination
        q.orderBy("messages.id", "asc")
        q.orderBy("messages.date", "asc")

        const messages = await q.select("messages.*").paginate(page ?? 1, perPage ?? 10)

        return {
            data: messages.all(),
            pagination: {
                perPage: messages.perPage,
                lastPage: messages.lastPage,
                firstPage: messages.firstPage,
                currentPage: messages.currentPage,
                total: messages.total
            }
        }
    }

    public async createMessage({ ownerId, groupId, threadId, content }: CreateMessageInput) {
        const owner = await User.findBy("id", ownerId)

        if (!owner) {
            throw HttpException.notFound("owner", ownerId)
        }

        const group = await Group.findBy("id", groupId)

        if (!group) {
            throw HttpException.notFound("group", groupId)
        }

        const thread = await Thread.findBy("id", threadId)

        if (!thread) {
            throw HttpException.notFound("thread", threadId)
        }

        if (groupId != thread.groupId) {
            throw new HttpException(422, "groups_differ", {
                thread_group_id: thread.groupId,
                message_group_id: groupId
            })
        }

        const message = new Message()
        message.fill({
            ownerId,
            groupId,
            threadId,
            content
        })

        return await message.save()
    }

    public async updateMessage(id: string, input: UpdateMessageInput, currentUser: User) {
        const message = await Message.findBy("id", id)

        if (!message) {
            throw HttpException.notFound("message", id)
        }

        // only can update messages if
        // - admin / owns the message
        // - group manage access
        // query group and membership of the user
        const currentUserRole = (await Database.from("group_members")
            .where("user_id", currentUser.id)
            .where("group_id", message.groupId)
            .select("group_role")
            .first())?.group_role

        // mod cannot update messages of admin
        // query membership of the owner of the message
        const userRole = (await Database.from("group_members")
            .where("user_id", message.ownerId)
            .where("group_id", message.groupId)
            .select("group_role")
            .first())?.group_role

        const check = () => {
            if (!currentUserRole) {
                return false;
            }

            if (currentUser.role === Role.ADMIN || currentUser.id === message.ownerId) {
                return true;
            }

            if (currentUserRole === GroupRole.ADMIN &&
                (userRole === GroupRole.MOD || userRole === GroupRole.MEMBER || userRole === null)) {
                return true;
            }

            if (currentUserRole === GroupRole.MOD &&
                (userRole === GroupRole.MEMBER || userRole === null)) {
                return true;
            }

            return false;
        }

        if (!check()) {
            throw new HttpException(401, "not_allowed", "Cannot update this message.")
        }

        message.merge(input)

        return (await message.save()).refresh()
    }

    public async deleteMessage(id: string, currentUser: User) {
        const message = await Message.findBy("id", id)

        if (!message) {
            throw HttpException.notFound("message", id)
        }

        // only can update messages if
        // - admin / owns the message
        // - group manage access
        // query group and membership of the user
        const currentUserRole = (await Database.from("group_members")
            .where("user_id", currentUser.id)
            .where("group_id", message.groupId)
            .select("group_role")
            .first())?.group_role

        // mod cannot update messages of admin
        // query membership of the owner of the message
        const userRole = (await Database.from("group_members")
            .where("user_id", message.ownerId)
            .where("group_id", message.groupId)
            .select("group_role")
            .first())?.group_role

        const check = () => {
            if (!currentUserRole) {
                return false;
            }

            if (currentUser.role === Role.ADMIN || currentUser.id === message.ownerId) {
                return true;
            }

            if (currentUserRole === GroupRole.ADMIN &&
                (userRole === GroupRole.MOD || userRole === GroupRole.MEMBER || userRole === null)) {
                return true;
            }

            if (currentUserRole === GroupRole.MOD &&
                (userRole === GroupRole.MEMBER || userRole === null)) {
                return true;
            }

            return false;
        }

        if (!check()) {
            throw new HttpException(401, "not_allowed", "Cannot update this message.")
        }

        // drop all ratings
        await message.related('ratings').detach()
        await message.delete()
    }

    public async rateMessage(messageId: string, userId: string, up: string) {

        const message = await Message.find(messageId)

        if (!message) {
            throw HttpException.notFound("message", messageId)
        }

        const message_rating = await Database.from("user_ratings")
            .select()
            .where("user_id", "=", userId)
            .andWhere("message_id", "=", messageId)

        if (message_rating.length == 0) {
            await Database.table("user_ratings").insert({
                user_id: userId,
                message_id: messageId,
                up: up
            })
        }

        if (message_rating.length == 1) {
            await Database.from("user_ratings")
                .where("user_id", "=", userId)
                .andWhere("message_id", "=", messageId)
                .delete()

            if (message_rating.at(0)?.up != up) {
                await Database.table("user_ratings").insert({
                    user_id: userId,
                    message_id: messageId,
                    up: up
                })
            }
        }

        let message_ratings = await Database.from("user_ratings")
            .select()
            .where("message_id", "=", messageId)

        let rating_final = 0
        for (const rate of message_ratings) {
            if (rate.up == "true") {
                rating_final += 1
            } else {
                rating_final -= 1
            }
        }

        message.rating = rating_final
        await message.save()
        return message.rating
    }
}
