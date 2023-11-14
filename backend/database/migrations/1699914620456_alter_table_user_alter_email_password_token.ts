import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      
      table.dropNullable("email")
      table.dropNullable("password")
      
      table.string('remember_me_token')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      
      table.setNullable("email")
      table.setNullable("password")
      
      table.dropColumn('remember_me_token')
    })
  }
}
