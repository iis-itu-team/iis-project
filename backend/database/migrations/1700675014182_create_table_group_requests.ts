import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { GroupRequestStatus, GroupRequestType } from 'types/group-request'

export default class extends BaseSchema {
  protected tableName = 'group_requests'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('user_id').references('users.id').notNullable()
      table.string('group_id').references('groups.id').notNullable()

      table.unique(['user_id', 'group_id', 'type'])

      table.enum('type', Object.values(GroupRequestType)).notNullable()
      table.enum('status', Object.values(GroupRequestStatus)).defaultTo(GroupRequestStatus.WAITING).notNullable()

      table.string('change_by_id').references('users.id').nullable()
      table.timestamp('changed_at', { useTz: true })

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
