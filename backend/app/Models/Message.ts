import { BaseModel, BelongsTo, ManyToMany, beforeCreate, belongsTo, column, manyToMany } from "@ioc:Adonis/Lucid/Orm";
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

    @column({ columnName: "rating" })
    public rating: number

    @column({ columnName: "user_id" })
    public userId: string

    @manyToMany(() => User, {
        relatedKey: 'userId',
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

        const date = new Date();

        const options = {
            hour: '2-digit',    // HH            
            minute: '2-digit',  // MM
            day: '2-digit',     // DD
            month: '2-digit',   // MM
            year: 'numeric'     // YYYY
          };
          
        message.date = date.toLocaleString('en-GB', options);

        message.rating = 0;
    }
}
