/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("room",(table)=>{
    table.integer("Id").notNullable();
    table.integer("status").notNullable();
    table.timestamp("start").notNullable();
    table.timestamp("end").notNullable();
    table.integer("user_One_Id").notNullable();
    table.integer("user_Two_Id").notNullable();
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists("room");
};
