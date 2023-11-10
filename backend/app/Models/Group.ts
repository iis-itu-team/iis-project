import { DateTime } from 'luxon'
import { BaseModel, HasMany, beforeCreate, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import generateId from "utils/generate-id"
import { Visibility } from "types/visibility"
import Thread from './Thread'

export default class Group extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true, })
  public id: string

  @column()
  public title: string

  @column()
  public visibility: Visibility

  // TODO: Add when users are implemented
  // public adminId: string

  @hasMany(() => Thread)
  public threads: HasMany<typeof Thread>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async assignId(group: Group) {
    group.id = generateId(group.id, "group")
  }
}
