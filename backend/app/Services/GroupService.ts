import HttpException from "App/Exceptions/HttpException"
import Group from "App/Models/Group"
import { PaginationInput } from "types/pagination"
import { PaginationResult } from "types/response-format"
import { Visibility } from "types/visibility"

export type GroupCreateInput = {
    title: string
    visibility?: Visibility
}

export type GroupUpdateInput = {
    title?: string
    visibility?: Visibility
}

export default class GroupService {
    public async list({ page, perPage }: PaginationInput = {
        page: 1,
        perPage: 10
    }): Promise<PaginationResult<Group>> {
        const res = await Group.query().paginate(page ?? 1, perPage ?? 10)

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

    public async get(groupId: string): Promise<Group | null> {
        return await Group.find(groupId);
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
    }
}
