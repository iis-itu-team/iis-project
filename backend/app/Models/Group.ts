import { DateTime } from 'luxon'
import { BaseModel, HasMany, ManyToMany, beforeCreate, column, computed, hasMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import generateId from "utils/generate-id"
import { Visibility } from "types/visibility"
import Thread from './Thread'
import User from './User'

export default class Group extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true, })
  public id: string

  @column()
  public title: string

  // private => only the group listing, cannot view content
  // protected => group and content can be only viewed by registered users
  // public => group content can be viewed by all users, even unregistered
  @column()
  public visibility: Visibility

  @hasMany(() => Thread)
  public threads: HasMany<typeof Thread>

  @computed()
  public get thread_count() {
    return this.threads?.length;
  }

  @manyToMany(() => User, {
    pivotTable: "group_members",
    localKey: "id",
    relatedKey: "id",
    pivotForeignKey: "group_id",
    pivotRelatedForeignKey: "user_id",
    pivotColumns: [
      "role",
      "joined_at"
    ]
  })
  public members: ManyToMany<typeof User>

  @computed()
  public get member_count() {
    return this.members?.length;
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async assignId(group: Group) {
    group.id = generateId(group.id, "group")
  }
}
