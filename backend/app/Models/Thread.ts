import User from "./User";
import { BaseModel, BelongsTo, beforeCreate, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import generateId from "utils/generate-id";
import Group from "./Group";
import { DateTime } from "luxon";

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

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime
 
    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @beforeCreate()
    public static async beforeCreate(thread: Thread) {
        thread.id = generateId(thread.id, "thread");
    }
}
