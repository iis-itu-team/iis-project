import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"
import GroupService from "App/Services/GroupService"
import { schema, rules } from "@ioc:Adonis/Core/Validator"
import { Visibility } from "types/visibility";

const listGroupSchema = schema.create({
    perPage: schema.number.optional([
        rules.unsigned(),
    ]),
    page: schema.number.optional([
        rules.unsigned()
    ]),
    userId: schema.string.optional(),
    expand: schema.string.optional()
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

    public async index({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: listGroupSchema
        })

        const groups = await this.groupService.list({
            ...validated,
            expand: validated.expand?.split(",") ?? []
        })

        response.list(groups)
    }

    public async show({ request, response }: HttpContextContract) {
        const groupId = request.param('id')

        const validated = await request.validate({
            schema: getGroupSchema
        })

        const group = await this.groupService.get(groupId, {
            ...validated,
            expand: validated.expand?.split(",") ?? []
        })

        if (!group) {
            response.status(404).fail("group_not_found");
            return;
        }

        response.success(group)
    }

    public async store({ request, response }: HttpContextContract) {
        const validated = await request.validate({ schema: createGroupSchema })

        const group = await this.groupService.create(validated)

        response.status(201).success(group)
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