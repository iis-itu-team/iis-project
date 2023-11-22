import { BaseModel, BelongsTo, beforeCreate, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import Group from "./Group";
import User from "./User";
import Thread from "./Thread";
import generateId from "utils/generate-id";

export default class Message extends BaseModel {
    public static selfAssignPrimaryKey = true;

    @column({ isPrimary: true })
    public id: string

    @column()
    public content: string

    @column({ columnName: "thread_id" })
    public threadId: string

    @belongsTo(() => Thread)
    public thread: BelongsTo<typeof Thread>

    @column({ columnName: "group_id" })
    public groupId: string

    @belongsTo(() => Group)
    public group: BelongsTo<typeof Group>

    @column({ columnName: "owner_id" })
    public ownerId: string

    @column({ columnName: "date" })
    public date: string

    @belongsTo(() => User, {
        foreignKey: "ownerId"
    })
    public owner: BelongsTo<typeof User>

    @beforeCreate()
    public static async beforeCreate(message: Message) {
        message.id = generateId(message.id, "message");

        const date = new Date();
        message.date = date.toISOString();
    }
}
