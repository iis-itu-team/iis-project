import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'group_members'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn("role", "group_role")
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn("group_role", "role")
    })
  }
}
