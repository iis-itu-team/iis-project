import { ExtractModelRelations } from "@ioc:Adonis/Lucid/Orm"
import HttpException from "App/Exceptions/HttpException"
import Group from "App/Models/Group"
import Message from "App/Models/Message"
import Thread from "App/Models/Thread"
import { PaginationInput } from "types/pagination"
import { ExpandInput } from "types/expand"
import { PaginationResult } from "types/response-format"
import { Visibility } from "types/visibility"

export type ListGroupsInput = PaginationInput & {
    userId?: string
} & ExpandInput

export type GetGroupInput = {} & ExpandInput

export type GroupCreateInput = {
    title: string
    visibility?: Visibility
}

export type GroupUpdateInput = {
    title?: string
    visibility?: Visibility
}

export default class GroupService {
    public async list({ page, perPage, userId, expand }: ListGroupsInput): Promise<PaginationResult<Group>> {
        const q = Group.query()

        // only groups, where the user is a member
        if (userId) {
            q.join("group_members", "id", "group_id");
        }

        expand.forEach((field) => q.preload(field as ExtractModelRelations<Group>));

        const res = await q.paginate(page ?? 1, perPage ?? 10)

        return {
            data: res.all(),
            pagination: {
                perPage: res.perPage,
                lastPage: res.lastPage,
                firstPage: res.firstPage,
                currentPage: res.currentPage
            }
        }
    }

    public async get(groupId: string, { expand }: GetGroupInput): Promise<Group | null> {
        const q = Group.query()
            .where("id", groupId)

        expand.forEach((field) => q.preload(field as ExtractModelRelations<Group>));

        return await q.first();
    }

    public async create(input: GroupCreateInput): Promise<Group> {
        const group = await Group
            .create({
                ...input
            })

        return group
    }

    public async update(groupId: string, input: GroupUpdateInput): Promise<Group> {
        const group = await Group.find(groupId)

        if (!group) {
            throw HttpException.notFound('group', groupId)
        }

        return await group.merge(input).save()
    }

    public async delete(groupId: string) {
        const group = await Group.find(groupId)

        if (!group) {
            throw HttpException.notFound('group', groupId)
        }

        await group.delete()

        // delete all messages in this group
        await Message.query()
            .where("group_id", groupId)
            .delete()

        // delete all threads in this group
        await Thread.query()
            .where("group_id", groupId)
            .delete()
    }
}
