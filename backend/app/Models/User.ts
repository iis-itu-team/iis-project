import { BaseModel, beforeCreate, column } from "@ioc:Adonis/Lucid/Orm"
import { Role } from "types/role";
import generateId from "utils/generate-id";

export default class User extends BaseModel {
    public static selfAssignPrimaryKey = true

    @column({ isPrimary: true })
    public id: string

    @column()
    public nickname: string

    @column()
    public password: string

    @column()
    public role: Role

    @beforeCreate()
    public static beforeCreate(user: User) {
        user.id = generateId(user.id, "user");
    }
}