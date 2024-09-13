/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    // Create 'albums' table with 'id' as VARCHAR for custom formatted IDs
    pgm.createTable('albums', {
        id: { type: 'varchar(50)', primaryKey: true }, // VARCHAR for custom formatted IDs
        name: { type: 'varchar(1000)', notNull: true },
        year: { type: 'integer', notNull: true },
    });

    // Create 'songs' table with 'albumId' as VARCHAR to match the 'id' of albums
    pgm.createTable('songs', {
        id: { type: 'varchar(50)', primaryKey: true }, // VARCHAR for custom formatted IDs
        title: { type: 'varchar(1000)', notNull: true },
        performer: { type: 'varchar(1000)', notNull: true },
        year: { type: 'integer' },
        genre: { type: 'varchar(1000)', notNull: true },
        duration: { type: 'integer' },
        albumId: { type: 'varchar(50)', references: '"albums"(id)', onDelete: 'CASCADE' } // References the VARCHAR 'id' in albums
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // Drop the 'songs' table first to handle foreign key constraints
    pgm.dropTable('songs');
    // Then drop the 'albums' table
    pgm.dropTable('albums');
};
