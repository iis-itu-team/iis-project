import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { Role } from 'types/role'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id')

      table.string('nickname').notNullable()
      table.string('email').notNullable()
      table.string('password').notNullable()

      table.enum('role', Object.values(Role))

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
