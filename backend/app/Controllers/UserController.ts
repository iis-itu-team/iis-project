import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"
import UserService from "App/Services/UserService"
import { schema } from "@ioc:Adonis/Core/Validator"
import { Role } from "types/role"
import User from "App/Models/User"

const updateUserSchema = schema.create({
    nickname: schema.string.optional(),
    role: schema.enum.optional(Object.values(Role))
})

export default class UserController {
    private readonly userService = new UserService()


    public async register({ request, response }) {
        const { nickname, password, email } = request.all()

        const user = await User.create({ nickname, password, email })
    
        return response.status(201).send({ message: 'User registered successfully', nickname, password, email })
    }

    public async login({ request, auth, response }) {
        const { nickname, password } = request.all()
    
        try {
            await auth.attempt(nickname, password)
            return response.send({ message: 'Login successful' })
        } catch (error) {
            return response.status(401).send({ message: 'Invalid credentials' })
        }
    }

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
