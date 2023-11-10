import User from "./User";
import { BaseModel, BelongsTo, beforeCreate, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import generateId from "utils/generate-id";
import Group from "./Group";

export default class Thread extends BaseModel {
    public static selfAssignPrimaryKey = true;

    @column({ isPrimary: true })
    public id: string
    @column()
    public title: string

    @column({ columnName: "owner_id" })
    public ownerId: string

    @belongsTo(() => User, {
        foreignKey: "ownerId"
    })
    public owner: BelongsTo<typeof User>

    @column({ columnName: "group_id" })
    public groupId: string

    @belongsTo(() => Group)
    public group: BelongsTo<typeof Group>

    @beforeCreate()
    public static async beforeCreate(thread: Thread) {
        thread.id = generateId(thread.id, "thread");
    }
}