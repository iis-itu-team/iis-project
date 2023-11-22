import HttpException from "App/Exceptions/HttpException";
import User from "App/Models/User";
import { Role } from "types/role";

export type UpdateUserInput = {
    nickname?: string
	email?: string
    role?: Role
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
