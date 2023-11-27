import HttpException from "App/Exceptions/HttpException"
import Group from "App/Models/Group"
import Message from "App/Models/Message"
import Thread from "App/Models/Thread"
import User from "App/Models/User"
import { PaginationInput } from "types/pagination"

export type ListThreadsInput = Partial<{
    groupId: string
    ownerId: string
}> & PaginationInput

export type CreateThreadInput = {
    groupId: string
    ownerId: string
    title: string
}

export type UpdateThreadInput = {
    title?: string
}

export default class ThreadService {
    public async listThreads({ groupId, ownerId, page, perPage }: ListThreadsInput) {
        const res = Thread.query()

        if (groupId) {
            res.andWhere("group_id", groupId)
        }

        if (ownerId) {
            res.andWhere("owner_id", ownerId)
        }

        const threads = await res.paginate(page ?? 1, perPage ?? 10)

        return {
            data: threads.all(),
            pagination: {
                perPage: threads.perPage,
                lastPage: threads.lastPage,
                firstPage: threads.firstPage,
                currentPage: threads.currentPage
                total: threads.total
            }
        }
    }

    public async getThread(id: string) {
        return await Thread.findBy("id", id)
    }

    public async createThread({ groupId, ownerId, title }: CreateThreadInput) {
        const group = await Group.findBy("id", groupId)

        if (!group) {
            throw HttpException.notFound("group", groupId)
        }

        const owner = await User.findBy("id", ownerId)

        if (!owner) {
            throw HttpException.notFound("owner", ownerId)
        }

        const thread = new Thread()
        thread.fill({
            title,
            groupId,
            ownerId
        })

        return await thread.save()
    }

    public async updateThread(id: string, { title }: UpdateThreadInput) {
        const thread = await Thread.findBy("id", id)

        if (!thread) {
            throw HttpException.notFound("thread", id)
        }

        thread.merge({
            title
        })

        return await thread.save()
    }

    public async deleteThread(id: string) {
        const thread = await Thread.findBy("id", id)

        if (!thread) {
            throw HttpException.notFound("thread", id)
        }

        // delete all messages in this thread
        await Message.query()
            .where("thread_id", id)
            .delete()

        await thread.delete()
    }
}
