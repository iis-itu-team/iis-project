import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { Visibility } from 'types/visibility'

export default class extends BaseSchema {
  protected tableName = 'groups'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('title').notNullable()

      table.enum('visibility', Object.values(Visibility))
        .notNullable()
        .defaultTo(Visibility.PRIVATE)

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
