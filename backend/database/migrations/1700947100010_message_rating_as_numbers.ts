import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
	protected tableName = 'messages'

	public async up() {
		this.schema.alterTable(this.tableName, (table) => {
			table.integer('rating_int')
		})
	}

	public async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn('rating_int')
		})
	}
}
