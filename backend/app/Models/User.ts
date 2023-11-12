import { BaseModel, HasMany, beforeCreate, column, hasMany } from "@ioc:Adonis/Lucid/Orm"
import { Role } from "types/role";
import generateId from "utils/generate-id";
import Group from "./Group";

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
    public role: Role

    @hasMany(() => Group)
    public groups: HasMany<typeof Group>

    @beforeCreate()
    public static beforeCreate(user: User) {
        user.id = generateId(user.id, "user");
    }
}