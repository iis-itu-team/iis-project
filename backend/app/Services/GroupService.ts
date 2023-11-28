import { ExtractModelRelations } from "@ioc:Adonis/Lucid/Orm"
import HttpException from "App/Exceptions/HttpException"
import Group from "App/Models/Group"
import Message from "App/Models/Message"
import Thread from "App/Models/Thread"
import { PaginationInput } from "types/pagination"
import { ExpandInput } from "types/expand"
import { PaginationResult } from "types/response-format"
import { Visibility } from "types/visibility"
import { GroupRole } from "types/group-role"
import Database from "@ioc:Adonis/Lucid/Database"
import User from "App/Models/User"
import { Role } from "types/role"
import GroupRequest from "App/Models/GroupRequest"

export type ListGroupsInput = PaginationInput & {
    userId?: string
    loggedInUserId?: string
    visibility?: Visibility
} & ExpandInput

export type GetGroupInput = {
    loggedInUserId?: string
} & ExpandInput

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
    public async checkPermissions(user?: User, groupId?: string) {
        if (!user) {
            throw new HttpException(401, "unauthenticated", "You're not authenticated.")
        }

        if (user.role == Role.ADMIN) {
            return
        }

        if (!groupId) {
            throw new HttpException(401, "not_allowed", "You're not allowed to do this.", {
                userRole: user.role
            })
        }

        const membership = await this.getGroupMembership(user.id, groupId);

        if (!membership) {
            throw new HttpException(401, "not_allowed", "You're not allowed to do this.", {
                userRole: user.role
            })
        }

        if (membership.group_role != GroupRole.MOD && membership.group_role != GroupRole.ADMIN) {
            throw new HttpException(401, "not_allowed", "You're not allowed to do this.", {
                userRole: user.role,
                groupRole: membership.group_role
            })
        }
    }

    public async getGroupMembership(userId: string, groupId: string) {
        return await Database.knexQuery().table("group_members")
            .where("user_id", userId)
            .andWhere("group_id", groupId)
            .first();
    }

    public async list({ page, perPage, userId, loggedInUserId, expand, visibility }: ListGroupsInput): Promise<PaginationResult<Group>> {
        const q = Group.query().distinctOn("groups.id")

        // only groups, where the user is a member
        if (userId) {
            q.join("group_members", "groups.id", "=", "group_members.group_id").where("group_members.user_id", userId);

            // append his membership
            q.select("*",
                Database.from("group_members")
                    .select("group_role")
                    .whereRaw("group_members.group_id = groups.id")
                    .where("user_id", userId)
                    .as("membership")
            );
        }

        expand.forEach((field) => q.preload(field as ExtractModelRelations<Group>));

        // compute membership fields using loggedInUserId
        if (!userId && loggedInUserId) {
            q.select("*",
                Database.from("group_members")
                    .select("group_role")
                    .whereRaw("group_members.group_id = groups.id")
                    .where("user_id", loggedInUserId)
                    .as("membership")
            );
        }

        if (visibility) {
            q.where("groups.visibility", "=", visibility)
        }

        const res = await q.paginate(page ?? 1, perPage ?? 10)

        return {
            data: res.all(),
            pagination: {
                perPage: res.perPage,
                lastPage: res.lastPage,
                firstPage: res.firstPage,
                currentPage: res.currentPage,
                total: res.total
            }
        }
    }

    public async get(groupId: string, { expand, loggedInUserId }: GetGroupInput): Promise<Group | null> {
        const q = Group.query()
            .where("id", groupId)
            .select("*",
                Database.from("group_members")
                    .select("group_role")
                    .whereRaw("group_members.group_id = groups.id")
                    .where("user_id", loggedInUserId!)
                    .as("membership")
            );

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

    public async kick(groupId: string, userId: string) {
        const group = await Group.query()
            .where("id", groupId)
            .preload("members")
            .first()

        if (!group) {
            throw HttpException.notFound("group", groupId)
        }

        const membership = group.members.find((m) => m.id === userId);

        if (!membership) {
            throw new HttpException(400, "not_a_member", "User is not a member.", {
                groupId, userId
            })
        }

        if (membership.group_role === GroupRole.ADMIN) {
            throw new HttpException(400, "is_admin", "Admins cannot be kicked or leave.", {
                groupId, userId
            })
        }

        await group.related("members").detach([userId])
    }

    public async delete(groupId: string) {
        const group = await Group.find(groupId)

        if (!group) {
            throw HttpException.notFound('group', groupId)
        }

        // delete all messages in this group
        await Message.query()
            .where("group_id", groupId)
            .delete()

        // delete all threads in this group
        await Thread.query()
            .where("group_id", groupId)
            .delete()

        // delete all requests
        await GroupRequest.query()
            .where("group_id", groupId)
            .delete()

        // delete all memberships
        await group.related("members").detach()

        await group.delete()
    }
}
