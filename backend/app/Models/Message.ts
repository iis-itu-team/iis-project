import { BaseModel, BelongsTo, ManyToMany, beforeCreate, belongsTo, column, manyToMany, computed } from "@ioc:Adonis/Lucid/Orm";
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

    @column({ columnName: "rating_int" })
    public rating: number 

    @column({ columnName: "user_id" })
    public userId: string

    @manyToMany(() => User, {
      pivotTable: "user_ratings",
      localKey: "id", // E: Replace `"id"` with `'id'`      
      relatedKey: "id", // E: Replace `"id"` with `'id'`    
      pivotForeignKey: "message_id", // E: Replace `"group_id"` with `'group_id'`
      pivotRelatedForeignKey: "user_id", // E: Replace `"user_id"` with `'user_id'`
      pivotTimestamps: true, // E: Replace `↹` with `····`
      pivotColumns: [ // E: Replace `⏎······"group_role"⏎····]` with `'group_role'],`
        "up"
      ]
    })
    public ratingUser: ManyToMany<typeof User>

    @belongsTo(() => User, {
        foreignKey: "ownerId"
    })
    public owner: BelongsTo<typeof User>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime
     
    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @beforeCreate()
    public static async beforeCreate(message: Message) {
        message.id = generateId(message.id, "message");

        message.date = new Date().toISOString();

        message.rating = 0;
    }
}
