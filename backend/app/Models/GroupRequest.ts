import { BaseModel, BelongsTo, beforeCreate, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import { GroupRequestStatus, GroupRequestType } from "types/group-request";
import generateId from "utils/generate-id";
import User from "./User";
import Group from "./Group";

export default class GroupRequest extends BaseModel {
    public static selfAssignPrimaryKey = true;

    @column({ isPrimary: true })
    public id: string

    @column()
    public type: GroupRequestType

    @column()
    public status: GroupRequestStatus

    @column({
        columnName: "group_id"
    })
    public groupId: string

    @belongsTo(() => Group, {
        foreignKey: "groupId"
    })
    public group: BelongsTo<typeof Group>

    @column({
        columnName: "user_id"
    })
    public userId: string

    @belongsTo(() => User, {
        foreignKey: "userId"
    })
    public user: BelongsTo<typeof User>

    @column({ columnName: "changed_by_id" })
    public changedById: string

    @belongsTo(() => User, {
        foreignKey: "changedById"
    })
    public changedBy: BelongsTo<typeof User>

    @column.dateTime()
    public changedAt: DateTime

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @beforeCreate()
    public static async beforeCreate(request: GroupRequest) {
        request.id = generateId(request.id, "req");
    }
}