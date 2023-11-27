import Database from "@ioc:Adonis/Lucid/Database";
import HttpException from "App/Exceptions/HttpException";
import User from "App/Models/User";
import Message from "App/Models/Message"
import { Role } from "types/role";
import { Visibility } from "types/visibility";
import GroupService from "./GroupService";
import MessageService from "./MessageService";
import GroupRequest from "App/Models/GroupRequest";
import ThreadService from "./ThreadService";

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
    private readonly groupService = new GroupService()
    private readonly messageService = new MessageService()
    private readonly threadService = new ThreadService()

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
                    .orWhere("user_id", loggedInUser.id)
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

        if (loggedInUser?.id == user.id) {
            return user;
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

        console.log("I am going to delete somebody!")

        if (!user) {
            throw HttpException.notFound("user", id)
        }

        const parseGroups = (item: { group_id: string }[]): string[] => {
            return item.map(item => item.group_id);
        }

        const parseMessages = (item: { id: string }[]): string[] => {
            return item.map(item => item.id);
        }

        const parseRequests = (item: { id: string }[]): string[] => {
            return item.map(item => item.id);
        }
    
        // delete all the user's groups
        const userGroups = parseGroups(await Database.from("users")
            .where("user_id", id)
            .join("group_members", "id", "user_id")
            .groupBy("group_id")
            .select("group_id")
        )

        for (let i in userGroups) {
            try {
                // kick user from all the groups
                await this.groupService.kick(userGroups[i], user.id)
            } catch (error) {
                // delete the whole group if the user is admin
                await this.groupService.delete(userGroups[i])
            }
        }

        // delete all the user's threads
        const userThreads = parseMessages(await Message.query()
            .where("owner_id", id)
            .select("id")
        )

        for (let i in userThreads) {
            console.log(userThreads[i])
            await this.threadService.deleteThread(userThreads[i])
        }

        // delete all the user's requests
        const userRequests = parseRequests(await GroupRequest.query()
            .where("user_id", id)
            .select("id")
        )

        for (let i in userRequests) {
            console.log(userRequests[i])
            await this.messageService.deleteMessage(userRequests[i], user)
        }
        
        // delete all the user's rating

        // TODO: only set owner_id to null
        // delete all the user's messgage
        const userMessages = parseMessages(await Message.query()
            .where("owner_id", id)
            .select("id")
        )

        for (let i in userMessages) {
            console.log(userMessages[i])
            await this.messageService.deleteMessage(userMessages[i], user)
        }

        await user.delete()
    }

    public async getStatistics(id: string) {
        const user = await User.findBy("id", id)

        if (!user) {
            throw HttpException.notFound("user", id)
        }

        // count returned by postgres in string, as per https://github.com/brianc/node-pg-types#use
        // force it to a number, might overflow
        const parseCount = (count?: { count?: string }[]) => {
            return count && count.length !== 0 && count[0].count !== undefined ? parseInt(count[0].count) : 0
        }

        const parseSum = (sum?: { sum?: string }[]) => {
            return sum && sum.length !== 0 && sum[0].sum !== undefined ? parseInt(sum[0].sum) : 0
        }

        // Messages posted
        const messagesPosted = parseCount(await Database.from("messages")
            .where("owner_id", id)
            .count("id"))

        // Positively rated messages posted by user
        const positivelyRated = parseCount(await Database.from("messages")
            .where("owner_id", id)
            .join("user_ratings", "messages.id", "message_id")
            .where("rating", ">", 0)
            .count("user_ratings.id"))

        const ratingsSubmitted = parseCount(await Database.from("user_ratings")
            .where("user_id", id)
            .count("id"))

        // Negatively rated messages posted by user
        const negativelyRated = parseCount(await Database.from("messages")
            .where("owner_id", id)
            .join("user_ratings", "messages.id", "message_id")
            .where("rating", "<", 0)
            .count("user_ratings.id"))

        // Joined groups
        const joinedGroups = parseCount(await Database.from("users")
            .where("user_id", id)
            .join("group_members", "id", "user_id")
            .groupBy("user_id")
            .count("user_id"))

        // User rating
        const userRating = parseSum(await Database.from("user_ratings")
            .join("messages", "message_id", "messages.id")
            .where("owner_id", id)
            .sum("messages.rating"))

        return {
            positivelyRated,
            negativelyRated,
            joinedGroups,
            messagesPosted,
            ratingsSubmitted,
            userRating
        }
    }
}
