import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"
import UserService from "App/Services/UserService"
import { schema } from "@ioc:Adonis/Core/Validator"
import { Role } from "types/role"

const updateUserSchema = schema.create({
    nickname: schema.string.optional(),
    role: schema.enum.optional(Object.values(Role))
})

export default class UserController {
    private readonly userService = new UserService()

    public async login({ request, auth, response }) {
        const { email, password } = request.all()
    
        try {
          await auth.attempt(email, password)
          return response.send({ message: 'Login successful' })
        } catch (error) {
          return response.status(401).send({ message: 'Invalid credentials' })
        }
      }

    // TODO: public async register({ request, auth, response })

    public async index({ response }: HttpContextContract) {
        const users = await this.userService.listUsers()

        response.success(users)
    }

    public async show({ request, response }: HttpContextContract) {
        const id = request.param("id")

        const user = await this.userService.getUser(id)

        response.success(user)
    }

    public async update({ request, response }: HttpContextContract) {
        const id = request.param("id")

        const validated = await request.validate({ schema: updateUserSchema })

        const user = await this.userService.updateUser(id, validated)

        response.success(user)
    }

    public async destroy({ request, response }: HttpContextContract) {
        const id = request.param("id")

        await this.userService.deleteUser(id)

        response.success()
    }
}
