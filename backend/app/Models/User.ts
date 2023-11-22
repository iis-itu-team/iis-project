import { BaseModel, HasMany, beforeCreate, beforeSave, column, hasMany } from "@ioc:Adonis/Lucid/Orm"
import { Role } from "types/role";
import generateId from "utils/generate-id";
import Group from "./Group";
import Hash from '@ioc:Adonis/Core/Hash'

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

    // todo: add default in new migration
    @column()
    public role: Role

    @hasMany(() => Group)
    public groups: HasMany<typeof Group>

    @beforeCreate()
    public static beforeCreate(user: User) {
        user.id = generateId(user.id, "user")
    }

    @beforeSave()
    public static async hashPassword(user: User) {
        if (user.$dirty.password) {
            user.password = await Hash.make(user.password)
        }
    }
}