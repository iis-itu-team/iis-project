import Database from "@ioc:Adonis/Lucid/Database"
import HttpException from "App/Exceptions/HttpException"
import GroupRequest from "App/Models/GroupRequest"
import User from "App/Models/User"
import { GroupRole } from "types/group-role"
import { PaginationInput } from "types/pagination"
import { GroupRequestStatus, GroupRequestType } from "types/group-request"
import { Role } from "types/role"
import { ExtractModelRelations } from "@ioc:Adonis/Lucid/Orm"

export type CreateRequestInput = {
    userId: string
    groupId: string
    type: GroupRequestType
}

export type ListRequestsInput = {
    userId?: string
    groupId?: string
    type?: GroupRequestType
    status?: GroupRequestStatus
    expand?: string[]
} & PaginationInput

export default class GroupRequestService {
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

    public async listRequests(input: ListRequestsInput) {
        const q = GroupRequest.query()

        if (input.userId) {
            q.andWhere("user_id", input.userId)
        }

        if (input.groupId) {
            q.andWhere("group_id", input.groupId)
        }

        if (input.type) {
            q.andWhere("type", input.type)
        }

        if (input.status) {
            q.andWhere("status", input.status)
        }

        if (input.expand) {
            input.expand.forEach((field) => q.preload(field as ExtractModelRelations<GroupRequest>))
        }

        const requests = await q.paginate(input.page ?? 1, input.perPage ?? 10)

        return {
            data: requests.all(),
            pagination: {
                perPage: requests.perPage,
                lastPage: requests.lastPage,
                firstPage: requests.firstPage,
                currentPage: requests.currentPage
            }
        }
    }

    public async getRequest(requestId: string) {
        return await GroupRequest.find(requestId)
    }

    public async createRequest({ userId, groupId, type }: CreateRequestInput): Promise<GroupRequest> {
        // check if exists
        const existing = await GroupRequest.query()
            .where("user_id", userId)
            .andWhere("group_id", groupId)
            .andWhere("type", type)
            .first();

        if (existing) {
            throw new HttpException(400, "already_exists", "You already have a request created, wait for approval.", {
                userId, groupId, type
            });
        }

        // if the user is already joined / already mod

        const membership = await Database.knexQuery()
            .table("users")
            .where("user_id", userId)
            .join("group_members", "id", "user_id")
            .andWhere("group_members.group_id", groupId)
            .first();

        if (type == GroupRequestType.JOIN && membership) {
            throw new HttpException(400, "already_joined", "You are already joined in this group.", {
                userId, groupId
            })
        }

        if (type == GroupRequestType.MOD && membership) {
            if (membership.role == GroupRole.MOD) {
                throw new HttpException(400, "already_mod", "You are already a moderator in this group.", {
                    userId, groupId
                })
            } else if (membership.role == GroupRole.ADMIN) {
                throw new HttpException(400, "already_admin", "You are an administator in this group.", {
                    userId, groupId
                })
            }
        }

        return await GroupRequest.create({
            userId, groupId, type
        });
    }

    public async changeStatus(requestId: string, status: GroupRequestStatus, user?: User) {
        const request = await GroupRequest.find(requestId)

        if (!request) {
            throw HttpException.notFound("group_request", requestId)
        }

        await this.checkPermissions(user, request.groupId);

        if (request.type == GroupRequestType.JOIN) {
            // join the user to the group
            await request.load("group")

            await request.group.related("members").attach([request.userId])
        } else if (request.type == GroupRequestType.MOD) {
            // promote the user
            await request.load("group")

            await request.group.related("members").pivotQuery()
                .where("user_id", request.userId)
                .update({
                    group_role: GroupRole.MOD
                })
        }

        request.status = status;
        await request.save()
    }

    public async deleteRequest(requestId: string) {
        const request = await GroupRequest.find(requestId)

        if (!request) {
            throw HttpException.notFound("group_request", requestId)
        }

        await request.delete()
    }
}