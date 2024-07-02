import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('meal_id').primary();
    table.text('name').notNullable();
    table.text('description').notNullable(),
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(),
      table.boolean('is_on_diet').notNullable(),
      table.uuid('author').index().references('id').inTable('users');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals');
}
