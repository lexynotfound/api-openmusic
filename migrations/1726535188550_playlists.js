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
    pgm.createTable('playlists', {
        id: { type: 'varchar(50)', primaryKey: true},
        name: { type: 'varchar(100)', notNull: true},
        users_id: { type: 'varchar(50)',references: '"users"(id)', onDelete: 'CASCADE'}
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // Drop the 'songs' table first to handle foreign key constraints
    pgm.dropTable('playlists');
};
