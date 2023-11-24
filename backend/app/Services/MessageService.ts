import { ExtractModelRelations } from "@ioc:Adonis/Lucid/Orm"
import HttpException from "App/Exceptions/HttpException"
import Group from "App/Models/Group"
import Message from "App/Models/Message"
import Thread from "App/Models/Thread"
import User from "App/Models/User"
import { PaginationInput } from "types/pagination"
import { ExpandInput } from "types/expand"
import Database from "@ioc:Adonis/Lucid/Database"

export type CreateMessageInput = {
    threadId: string
    groupId: string
    ownerId: string
    content: string
}

export type ListMessagesInput = {
    threadId: string
    groupId: string
    ownerId: string
} & PaginationInput & ExpandInput

export default class MessageService {
    public async listMessages({ ownerId, groupId, threadId, page, perPage, expand }: ListMessagesInput) {
        const q = Message.query()

        if (threadId) {
            q.andWhere("thread_id", threadId)
        }

        if (groupId) {
            q.andWhere("group_id", groupId)
        }

        if (ownerId) {
            q.andWhere("owner_id", ownerId)
        }
        
        // preload expand fields
        expand.forEach((e) => q.preload(e as ExtractModelRelations<Message>));

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

    public async deleteMessage(id: string) {
        const message = await Message.findBy("id", id)

        if (!message) {
            throw HttpException.notFound("message", id)
        }

        await message.delete()
    }

    public async rateMessage(message_id: string, user_id: string, up: string) {

        const message = await Message.findBy("id", message_id)
        
        if (!message) {
            throw HttpException.notFound("message", message_id)
        }

        const q = await Database.knexQuery().table("messages")
            .where("user_id", user_id)

        console.log(q)

        if (q !== null) {
            console.log("User already rated this message", user_id, message.userId)
            return message.rating 
        } else {
            await message.userId().attach([user_id]);
        }

        if (message.rating == null) {
            message.rating = 0
        }

        console.log(up)

        if (up === "true") {
            message.rating++
        } else {
            message.rating--
        }

        console.log(message.rating)
        
        await message.save()
        return message.rating
    }
}
