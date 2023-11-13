import User from "App/Models/User"
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {

    public async register({ request, response }: HttpContextContract) {
        const { nickname, password, email } = request.all()

        try {
            const user = await User.create({ nickname, email, password })
            console.log(user)
            return response.send({ message: 'New account was created successfully' })
        } catch (error) {
            console.log(error)
            return response.status(401).send({ message: 'User cannot be created' })
        }
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
}
