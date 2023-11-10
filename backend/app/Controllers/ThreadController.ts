import ThreadService from "App/Services/ThreadService";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"
import { schema, rules } from "@ioc:Adonis/Core/Validator"

const listThreadsSchema = schema.create({
    perPage: schema.number.optional([
        rules.unsigned(),
    ]),
    page: schema.number.optional([
        rules.unsigned()
    ]),
    ownerId: schema.string.optional(),
    groupId: schema.string.optional()
})

const createThreadsSchema = schema.create({
    title: schema.string(),
    ownerId: schema.string()
})

const updateThreadSchema = schema.create({
    title: schema.string.optional(),
})

export default class ThreadController {
    private readonly threadService = new ThreadService()

    // both nested and flat
    // /threads, /groups/:group_id/threads
    public async index({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: listThreadsSchema
        })

        const groupId = request.param("group_id", validated.groupId)

        const groups = await this.threadService.listThreads({ ...validated, groupId })

        response.list(groups)
    }

    public async show({ request, response }: HttpContextContract) {
        const id = request.param("thread_id")

        const thread = await this.threadService.getThread(id)

        response.success(thread)
    }

    // only nested
    // /groups/:group_id/threads
    public async store({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: createThreadsSchema
        })

        const groupId = request.param("group_id")

        const thread = await this.threadService.createThread({ ...validated, groupId })

        response.status(201).success(thread)
    }

    // only flat
    public async update({ request, response }: HttpContextContract) {
        const id = request.param("thread_id")

        const validated = await request.validate({
            schema: updateThreadSchema
        })

        const thread = await this.threadService.updateThread(id, validated)

        response.success(thread)
    }

    // only flat
    public async destroy({ request, response }: HttpContextContract) {
        const id = request.param("thread_id")

        await this.threadService.deleteThread(id)

        response.success()
    }
}