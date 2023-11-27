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
                    q.leftJoin('groups', 'messages.group_id', 'groups.id')
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

        const messages = await q.paginate(page ?? 1, perPage ?? 10)

        return {
            data: messages.all(),
            pagination: {
                perPage: messages.perPage,
                lastPage: messages.lastPage,
                firstPage: messages.firstPage,
                currentPage: messages.currentPage
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
        if (currentUser.role !== Role.ADMIN &&
            message.ownerId !== currentUser.id) {
            // query group and membership of the user
            const group = await Group.query()
                .join('group_members', (query) => {
                    query.on('groups.id', 'group_members.group_id')
                        .andOnVal('group_members.user_id', currentUser.id)
                })
                .first()

            if (group?.$extras.group_role === null ||
                (group?.$extras.group_role !== GroupRole.ADMIN &&
                    group?.$extras.group_role !== GroupRole.MOD)) {
                throw new HttpException(401, "not_allowed", "Not allowed to update messages.")
            }

            // mod cannot update messages of admin
            // query membership of the owner of the message
            const membership = await Database.from("group_members")
                .where("user_id", message.ownerId)
                .where("group_id", group.id)
                .select("group_role")
                .first()

            console.log(membership)
        }

        message.merge(input)

        return (await message.save()).refresh()
    }

    public async deleteMessage(id: string, currentUser: User) {
        const message = await Message.findBy("id", id)

        if (!message) {
            throw HttpException.notFound("message", id)
        }

        // only can delete messages if
        // - admin / owns the message
        // - group manage access
        if (currentUser.role !== Role.ADMIN &&
            message.ownerId !== currentUser.id) {
            // query group and membership of the user
            const group = await Group.query()
                .leftJoin('group_members', (query) => {
                    query.on('groups.id', 'group_members.group_id')
                        .andOnVal('group_members.user_id', currentUser.id)
                })
                .first()

            if (group?.$extras.group_role === null ||
                (group?.$extras.group_role !== GroupRole.ADMIN &&
                    group?.$extras.group_role !== GroupRole.MOD)) {
                throw new HttpException(401, "not_allowed", "Not allowed to update messages.")
            }
        }

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
