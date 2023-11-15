import User from "App/Models/User"
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {

    public async register({ request, response, auth }: HttpContextContract) {
        const { nickname, password, email } = request.all()

        // TODO: check if the email is already taken
        // TODO: Move that logic in to a service (App\Services)

        try {
            const user = await User.create({ nickname, email, password })
            await auth.login(user)
            return response.status(201).success(user)
        } catch (error) {
            response.status(401).formatted({ status: 'user_cannot_be_created' })
        }
    }

    public async login({ request, response, auth }: HttpContextContract) {
        const { uid, password } = request.all()

        try {
            const user = await auth.attempt(uid, password)

            response.status(200).formatted({
                status: 'success',
                data: user
            })
        } catch (error) {
            response.status(401).formatted({ status: 'invalid_credentials' })
        }
    }

    public async me({ request, response }: HttpContextContract) {
        const {nickname} = request.all()

        const user = await User.findBy("nickname", nickname)
        response.status(200).formatted({
            status: 'success',
            data: user
        })
    }
}
