import { ExtractModelRelations } from "@ioc:Adonis/Lucid/Orm"
import HttpException from "App/Exceptions/HttpException"
import Group from "App/Models/Group"
import Message from "App/Models/Message"
import Thread from "App/Models/Thread"
import { PaginationInput } from "types/pagination"
import { ExpandInput } from "types/expand"
import { PaginationResult } from "types/response-format"
import { Visibility } from "types/visibility"
import { Membership } from "types/membership"
import { GroupRole } from "types/group-role"
import Database from "@ioc:Adonis/Lucid/Database"

export type ListGroupsInput = PaginationInput & {
    userId?: string
    loggedInUserId?: string
} & ExpandInput

export type GetGroupInput = {} & ExpandInput

export type GroupCreateInput = {
    title: string
    visibility?: Visibility

    // user to add as admin
    adminId?: string
}

export type GroupUpdateInput = {
    title?: string
    visibility?: Visibility
}

export default class GroupService {
    public async list({ page, perPage, userId, loggedInUserId, expand }: ListGroupsInput): Promise<PaginationResult<Group>> {
        const q = Group.query().distinctOn("groups.id")

        // only groups, where the user is a member
        if (userId) {
            q.join("group_members", "id", "group_id");
        }

        expand.forEach((field) => q.preload(field as ExtractModelRelations<Group>));

        const res = await q.paginate(page ?? 1, perPage ?? 10)

		// compute membership fields using loggedInUserId
		if (loggedInUserId) {
			const queryResult = await Database.from("group_members")
				.select()
				.where("user_id", loggedInUserId)
			res.forEach((group, idx, arr) => {
				if (queryResult.findIndex((value) => {return value.group_id == group.id}) != -1) {
					group.membership = Membership.TRUE;	
				}
			})
		}

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
                title: input.title,
                visibility: input.visibility ?? Visibility.PRIVATE
            })

        if (input.adminId) {
            await group.related("members").attach({
                [input.adminId]: {
                    group_role: GroupRole.ADMIN
                }
            })
        }

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
