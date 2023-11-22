import GroupRequestService from "App/Services/RequestService";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema } from "@ioc:Adonis/Core/Validator";
import { GroupRequestStatus, GroupRequestType } from "types/group-request";
import User from "App/Models/User";

const createRequestSchema = schema.create({
    type: schema.enum(Object.values(GroupRequestType))
})

const listRequestSchema = schema.create({
    userId: schema.string.optional(),

    type: schema.enum.optional(Object.values(GroupRequestType)),
    status: schema.enum.optional(Object.values(GroupRequestStatus))
})

export default class GroupRequestController {
    private readonly requestService = new GroupRequestService();

    public async index({ auth, request, response }: HttpContextContract) {
        const groupId = request.param("group_id")

        const validated = await request.validate({
            schema: listRequestSchema
        })

        // list the requests only if the current user is admin
        // or group admin or group mod

        const user = auth.user as User;

        await this.requestService.checkModifyPermissions(user, groupId);

        const requests = await this.requestService.listRequests({
            ...validated,
            groupId,
        })

        response.list(requests)
    }

    public async show({ auth, request, response }: HttpContextContract) {
        const requestId = request.param("id")

        const groupRequest = await this.requestService.getRequest(requestId)

        // list the requests only if the current user is admin
        // or group admin or group mod

        const user = auth.user as User

        await this.requestService.checkModifyPermissions(user, groupRequest?.groupId)

        if (groupRequest) {
            response.success(groupRequest)
        } else {
            response.fail("not_found")
        }
    }

    public async store({ auth, request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: createRequestSchema
        })

        const groupId = request.param("group_id")
        const userId = auth.user?.id

        const groupRequest = await this.requestService.createRequest({
            ...validated,
            groupId,
            userId
        })

        response.success(groupRequest)
    }

    public async destroy({ request, response }: HttpContextContract) {
        const requestId = request.param("id")

        await this.requestService.deleteRequest(requestId)

        response.success()
    }
}