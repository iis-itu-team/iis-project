import User from "App/Models/User"
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {

    public async register({ request, response }: HttpContextContract) {
        const { nickname, password, email } = request.all()

        // TODO: check if the email is already taken
        // TODO: Move that logic in to a service (App\Services)

        const user = await User.create({ nickname, email, password })

        response.status(201).success(user)
    }

    public async login({ request, auth, response }: HttpContextContract) {
        const { email, password } = request.all()

        // TODO: Check whether the user with this email exists

        try {
            const user = await auth.attempt(email, password)

            response.status(200).formatted({
                status: 'success',
                data: user
            })
        } catch (error) {
            response.status(401).formatted({ status: 'invalid_credentials' })
        }
    }
}
