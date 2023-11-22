import Database from "@ioc:Adonis/Lucid/Database"
import HttpException from "App/Exceptions/HttpException"
import GroupRequest from "App/Models/GroupRequest"
import User from "App/Models/User"
import { GroupRole } from "types/group-role"
import { PaginationInput } from "types/pagination"
import { GroupRequestStatus, GroupRequestType } from "types/group-request"
import { Role } from "types/role"

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
} & PaginationInput

export default class GroupRequestService {
    public async checkModifyPermissions(user: User, groupId?: string) {
        if (user.role != Role.ADMIN) {
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

            if (membership.role != GroupRole.MOD && membership.role != GroupRole.ADMIN) {
                throw new HttpException(401, "not_allowed", "You're not allowed to do this.", {
                    userRole: user.role,
                    groupRole: membership.role
                })
            }
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

    public async createRequest({ userId, groupId, type }: CreateRequestInput) {
        // check if exists
        const existing = await GroupRequest.query()
            .where("user_id", userId)
            .andWhere("group_id", groupId)
            .andWhere("type", type)
            .first();

        if (existing !== null) {
            throw new HttpException(400, "already_exists", "You already have a request created, wait for approval.", {
                userId, groupId, type
            });
        }

        // if the user is already joined / already mod

        const membership = await Database.knexQuery()
            .table("users")
            .where("user_id", userId)
            .join("group_members", "id", "user_id")
            .where("group_id", groupId)
            .first();

        if (type == GroupRequestType.JOIN && membership !== null) {
            throw new HttpException(400, "already_joined", "You are already joined in this group.", {
                userId, groupId
            })
        }

        if (type == GroupRequestType.MOD && membership !== null) {
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

    public async deleteRequest(requestId: string) {
        const request = await GroupRequest.find(requestId)

        if (!request) {
            throw HttpException.notFound("group_request", requestId)
        }

        await request.delete()
    }
}