import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      
      table.string('date')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
    
      table.dropColumn('date')
    })
  }
}
