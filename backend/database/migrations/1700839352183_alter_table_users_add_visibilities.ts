import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { Visibility } from 'types/visibility'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('visibility', Object.values(Visibility)).defaultTo(Visibility.PUBLIC)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('visibility')
    })
  }
}
