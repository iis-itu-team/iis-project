import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { Role } from 'types/role'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('role', Object.values(Role)).defaultTo(Role.USER).alter({
        alterType: false,
        alterNullable: true
      })
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('role', Object.values(Role)).defaultTo(null).alter({
        alterType: false,
        alterNullable: false
      })
    })
  }
}
