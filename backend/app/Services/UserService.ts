import HttpException from "App/Exceptions/HttpException";
import User from "App/Models/User";
import { Role } from "types/role";
import { Visibility } from "types/visibility";

export type UpdateUserInput = {
    nickname?: string
    email?: string
    role?: Role
}

export type CreateUserInput = {
    nickname: string
    email: string
    password: string
    visibility?: Visibility
}

export default class UserService {
    public async listUsers() {
        return await User.all()
    }

    public async getUser(id: string) {
        const user = await User.findBy("id", id)

        if (!user) {
            throw HttpException.notFound("user", id)
        }

        return user
    }

    public async createUser({ email, nickname, password, visibility }: CreateUserInput) {
        const existing = await User.query()
            .where("email", email)
            .orWhere("nickname", nickname)
            .first()

        if (existing) {
            throw new HttpException(400, "nickname_or_email_taken", "Nickname or email are already taken.",
                { email, nickname })
        }

        const user = await User.create({ nickname, email, password, visibility })

        return user
    }

    public async updateUser(id: string, input: UpdateUserInput) {
        const user = await this.getUser(id)

        if (!user) {
            throw HttpException.notFound("user", id)
        }

        // only user himself or an administrator can update him
        // todo: get currently logged in user and check if he's an admin or the user
        // we're trying to edit

        user.merge(input)
        return await user.save()
    }

    public async deleteUser(id: string) {
        const user = await User.findBy("id", id)

        if (!user) {
            throw HttpException.notFound("user", id)
        }

        // todo: delete everything the user owns
        await user.delete()
    }
}
