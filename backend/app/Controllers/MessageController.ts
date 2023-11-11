import MessageService from "App/Services/MessageService"
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"
import { schema } from "@ioc:Adonis/Core/Validator"

const listMessagesSchema = schema.create({
    threadId: schema.string.optional(),
    groupId: schema.string.optional(),
    ownerId: schema.string.optional()
})

const createMessageSchema = schema.create({
    ownerId: schema.string(),
    content: schema.string()
})

export default class MessageController {
    private readonly messageService = new MessageService()

    // /groups/:group_id/threads/:thread_id/messages
    // /groups/:group_id/messages
    // /messages
    public async index({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: listMessagesSchema
        })

        const threadId = request.param("thread_id", validated.threadId)
        const groupId = request.param("group_id", validated.groupId)
        const ownerId = request.param("owner_id", validated.ownerId)

        const messages = await this.messageService.listMessages({
            threadId,
            groupId,
            ownerId
        })

        response.list(messages)
    }

    // /groups/:group_id/threads/:thread_id/messages
    public async store({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: createMessageSchema
        })

        const threadId = request.param("thread_id")
        const groupId = request.param("group_id")

        const message = await this.messageService.createMessage({
            threadId,
            groupId,
            ...validated
        })

        response.status(201).success(message)
    }

    public async destroy({ request, response }: HttpContextContract) {
        const id = request.param("id")

        await this.messageService.deleteMessage(id)

        response.success()
    }
}