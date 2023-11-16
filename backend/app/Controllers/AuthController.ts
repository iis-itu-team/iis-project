import User from "App/Models/User"
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {

    public async register({ request, response, auth }: HttpContextContract) {
        const { nickname, password, email } = request.all()

        if ((await User.findBy("email", email) != null) || (await (User.findBy("nickname", nickname)) != null)) {
            return response.status(401).formatted({ status: 'nickname_or_email_taken' })
        }

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

    public async logout({ response, auth }: HttpContextContract) {

        if (auth.isLoggedIn == false) {
            response.status(401).formatted({
                status: "unauthenticated"
            });
            return;
        }

        response.status(200).success(await auth.logout());
    }

    public async me({ auth, response }: HttpContextContract) {

        if (auth.isLoggedIn == false) {
            response.status(401).formatted({
                status: "unauthenticated"
            });
            return;
        }

        response.status(200).success(auth.user);
    }
}
