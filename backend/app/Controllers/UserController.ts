import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"
import UserService from "App/Services/UserService"
import { schema, rules } from "@ioc:Adonis/Core/Validator"
import { Role } from "types/role"
import { Visibility } from "types/visibility"
import User from "App/Models/User"

const updateUserSchema = schema.create({
    nickname: schema.string.optional([
        rules.minLength(5)
    ]),
    email: schema.string.optional([
        rules.email()
    ]),
    role: schema.enum.optional(Object.values(Role)),
    visibility: schema.enum.optional(Object.values(Visibility))
})

export default class UserController {
    private readonly userService = new UserService()

    public async index({ auth, response }: HttpContextContract) {
        // only return users that are visible to the logged in user or guest
        const users = await this.userService.listUsers(auth.user as User)

        response.success(users)
    }

    public async show({ auth, request, response }: HttpContextContract) {
        const id = request.param("id")

        // only allow if the user profile is visible to the logged in user
        const loggedInUser = auth.user as User;

        const user = await this.userService.getUser(id, loggedInUser)

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

    public async statistic( {request, response }: HttpContextContract) {
        const id = request.param("user_id")
        
        const data = await this.userService.statisticUser(id)

        response.success(data)
    }
}
