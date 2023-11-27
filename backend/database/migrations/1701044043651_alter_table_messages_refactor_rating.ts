import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  public async up() {
    // split into two calls: cannot drop and then recreate immediately

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('rating_int')
      table.dropColumn('rating')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.integer('rating').defaultTo(0).notNullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('rating')

      table.string('rating')
      table.integer('rating_int')
    })
  }
}
