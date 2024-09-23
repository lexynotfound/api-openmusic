/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('users', {
        id: { type: 'varchar(50)', primaryKey: true},
        username: { type: 'varchar(100)', notNull: true, unique: true},
        fullname: { type: 'varchar(100)', notNull: true},
        email: { type: 'varchar(100)', notNull: true, unique: true},
        password: { type: 'varchar(100)', notNull:true},
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('users');
};
