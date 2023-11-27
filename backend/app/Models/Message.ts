import { BaseModel, BelongsTo, ManyToMany, beforeCreate, belongsTo, column, computed, manyToMany } from "@ioc:Adonis/Lucid/Orm";
import Group from "./Group";
import User from "./User";
import Thread from "./Thread";
import generateId from "utils/generate-id";
import { DateTime } from "luxon";

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

  @belongsTo(() => User, {
    foreignKey: "ownerId"
  })
  public owner: BelongsTo<typeof User>

  @column({ columnName: "date" })
  public date: string

  @column()
  public rating: number

  @manyToMany(() => User, {
    pivotTable: "user_ratings",
    localKey: "id",
    relatedKey: "id",
    pivotForeignKey: "message_id",
    pivotRelatedForeignKey: "user_id",
    pivotTimestamps: true,
    pivotColumns: [
      "up"
    ]
  })
  public ratings: ManyToMany<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get user_rating() {
    if ("user_rating" in this.$extras)
      return this.$extras.user_rating
  }

  @beforeCreate()
  public static async beforeCreate(message: Message) {
    message.id = generateId(message.id, "message");

    message.date = new Date().toISOString();
  }
}
