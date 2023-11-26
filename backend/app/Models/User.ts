import { BaseModel, HasMany, beforeCreate, beforeSave, column, computed, hasMany } from "@ioc:Adonis/Lucid/Orm"
import { Role } from "types/role";
import generateId from "utils/generate-id";
import Group from "./Group";
import Message from "./Message";
import Hash from '@ioc:Adonis/Core/Hash'
import { Visibility } from "types/visibility";
import { DateTime } from "luxon";

export default class User extends BaseModel {
    public static selfAssignPrimaryKey = true

    @column({ isPrimary: true })
    public id: string

    @column()
    public nickname: string

    @column()
    public email: string

    @column({ serializeAs: null })
    public password: string

    @column()
    public rememberMeToken: string | null

    // todo: add default in new migration
    @column()
    public role: Role

    @column()
    public visibility: Visibility

    @hasMany(() => Group)
    public groups: HasMany<typeof Group>

	@hasMany(() => Message)
	public ratings: HasMany<typeof Message>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @beforeCreate()
    public static beforeCreate(user: User) {
        user.id = generateId(user.id, "user")
    }

    @computed()
    public get group_role() {
        if ("pivot_group_role" in this.$extras)
            return this.$extras.pivot_group_role
    }

    @beforeSave()
    public static async hashPassword(user: User) {
        if (user.$dirty.password) {
            user.password = await Hash.make(user.password)
        }
    }
}
