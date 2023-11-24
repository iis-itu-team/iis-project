import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from "@ioc:Adonis/Core/Validator"
import { Visibility } from "types/visibility"
import UserService from "App/Services/UserService"

const registerSchema = schema.create({
    nickname: schema.string([
        rules.minLength(5)
    ]),
    email: schema.string([
        rules.email()
    ]),
    password: schema.string([
        rules.minLength(5)
    ]),
    visibility: schema.enum.optional(Object.values(Visibility))
})

const loginSchema = schema.create({
    uid: schema.string(),
    password: schema.string()
})

export default class AuthController {
    private readonly userService = new UserService()

    public async register({ request, response, auth }: HttpContextContract) {
        const validated = await request.validate({
            schema: registerSchema
        })

        const user = await this.userService.createUser(validated)

        await auth.login(user)

        response.status(201).success(user)
    }

    public async login({ request, response, auth }: HttpContextContract) {
        const { uid, password } = await request.validate({
            schema: loginSchema
        })

        try {
            const user = await auth.attempt(uid, password)

            response.success(user)
        } catch {
            response.status(401).formatted({ status: 'invalid_credentials' })
        }
    }

    public async logout({ response, auth }: HttpContextContract) {
        response.status(200).success(await auth.logout());
    }

    public async me({ auth, response }: HttpContextContract) {
        response.status(200).success(auth.user);
    }
}
