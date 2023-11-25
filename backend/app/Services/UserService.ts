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
    public async listUsers(loggedInUser?: User) {
        const q = User.query()

        // if not loggedIn, return only public
        if (!loggedInUser) {
            q.where("visibility", Visibility.PUBLIC)
        } else {
            if (loggedInUser.role === Role.USER) {
                // if not admin, return protected, public
                q.where("visibility", Visibility.PROTECTED)
                    .orWhere("visibility", Visibility.PUBLIC)
            }
            // if admin, return all
        }

        return await q
    }

    public async getUser(id: string, loggedInUser?: User) {
        const user = await User.findBy("id", id)

        if (!user) {
            throw HttpException.notFound("user", id)
        }

        if (loggedInUser?.role == Role.ADMIN) {
            return user
        }

        if (loggedInUser && user.visibility === Visibility.PROTECTED) {
            return user
        }

        if (user.visibility == Visibility.PUBLIC) {
            return user;
        }

        throw new HttpException(403, "not_allowed", "You cannot access this profile.", {
            visibility: user.visibility,
            you: loggedInUser
        })
    }

    public async createUser({ email, nickname, password, visibility }: CreateUserInput) {
        await this.checkExists(email, nickname);

        const user = await User.create({ nickname, email, password, visibility })

        return user
    }

    private async checkExists(email?: string, nickname?: string) {
        if (!email && !nickname) {
            return;
        }

        const existingQ = User.query()

        if (email) {
            existingQ.where("email", email)
        }

        if (nickname) {
            existingQ.orWhere("nickname", nickname)
        }

        const existing = await existingQ.first()

        if (existing) {
            if (existing.email === email) {
                throw new HttpException(400, "email_taken", "Email is already taken.",
                    { email })
            } else {
                throw new HttpException(400, "nickname_taken", "Nickname is already taken.",
                    { nickname })
            }
        }
    }

    private deleteUnchanged<T extends Object>(original: T, input: T) {
        Object.keys(original).forEach((k) => {
            if (original[k] === input[k]) {
                delete input[k];
            }
        })
    }

    public async updateUser(id: string, input: UpdateUserInput) {
        const user = await User.find(id)

        if (!user) {
            throw HttpException.notFound("user", id)
        }

        // no need to update what stays the same
        this.deleteUnchanged(user.$attributes, input)

        await this.checkExists(input.email, input.nickname)

        // only user himself or an administrator can update him
        // todo: get currently logged in user and check if he's an admin or the user
        // we're trying to edit

        user.merge(input)

        return await user.save()
    }

    public async deleteUser(id: string) {
        const user = await User.find(id)

        if (!user) {
            throw HttpException.notFound("user", id)
        }

        // todo: delete everything the user owns
        await user.delete()
    }
}
