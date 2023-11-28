import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"
import GroupService from "App/Services/GroupService"
import { schema } from "@ioc:Adonis/Core/Validator"
import { Visibility } from "types/visibility";
import User from "App/Models/User";
import { paginationSchema } from "types/pagination";

const listGroupSchema = schema.create({
    userId: schema.string.optional(),
    expand: schema.string.optional(),

    visibility: schema.enum.optional(Object.values(Visibility)),

    ...paginationSchema
})

const getGroupSchema = schema.create({
    expand: schema.string.optional()
})

const createGroupSchema = schema.create({
    title: schema.string(),
    visibility: schema.enum(Object.values(Visibility))
})

const updateGroupSchema = schema.create({
    title: schema.string.optional(),
    visibility: schema.enum.optional(Object.values(Visibility))
})

export default class {
    private readonly groupService: GroupService = new GroupService();

    public async index({ request, response, auth }: HttpContextContract) {
        const validated = await request.validate({
            schema: listGroupSchema
        })

        // id used to signify membership
        const loggedInUserId = auth.user?.id;

        const groups = await this.groupService.list({
            ...validated,
            loggedInUserId: loggedInUserId,
            expand: validated.expand?.split(",") ?? []
        })

        response.list(groups)
    }

    public async show({ auth, request, response }: HttpContextContract) {
        const groupId = request.param('id')

        const validated = await request.validate({
            schema: getGroupSchema
        })

        const loggedInUserId = auth.user?.id ?? ''

        const group = await this.groupService.get(groupId, {
            ...validated,
            expand: validated.expand?.split(",") ?? [],
            loggedInUserId
        })

        if (!group) {
            response.status(404).fail("group_not_found");
            return;
        }

        response.success(group)
    }

    public async store({ auth, request, response }: HttpContextContract) {
        const validated = await request.validate({ schema: createGroupSchema })

        const adminId = auth.user?.id

        const group = await this.groupService.create({ ...validated, adminId })

        response.status(201).success(group)
    }

    public async kick({ auth, request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: schema.create({
                userId: schema.string()
            })
        })

        const groupId = request.param("id")

        // verfiy the current user can kick
        await this.groupService.checkPermissions(auth.user as User, groupId)

        await this.groupService.kick(groupId, validated.userId)

        response.success()
    }

    public async update({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: updateGroupSchema
        })

        const groupId = request.param('id')

        const group = await this.groupService.update(groupId, validated)

        response.success(group)
    }

    public async destroy({ request, response }: HttpContextContract) {
        const groupId = request.param('id')

        await this.groupService.delete(groupId)

        response.success()
    }
}
