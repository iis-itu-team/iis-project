import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { GroupRole } from 'types/group-role'

export default class extends BaseSchema {
  protected tableName = 'group_members'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('user_id').references("users.id")
      table.string('group_id').references("groups.id")

      table.unique(["user_id", "group_id"])

      table.enum('role', Object.values(GroupRole)).defaultTo(GroupRole.MEMBER)

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
