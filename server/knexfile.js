// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

    client: 'mysql2',
    connection: {
      host:"172.17.0.3",
      database: 'edumeet',
      user:     'root',
      password: 'mysql'
    },
    pool: {
      min: 2,
      max: 10
    },
   


};
