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
    pgm.createTable('albums', {
        id: {type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()')},
        name: { type: 'varchar(1000)', notNull: true},
        yaer: { type: 'integer', notNull: true },
    });

    pgm.createTable('songs', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()')},
        title: { type: 'varchar(1000)', notNull: true},
        performer: { type: 'varchar(1000)', notNull: true},
        year: { type: 'integer'},
        genre: { type: 'varchar(1000)', notNull: true},
        duration: { type: 'integer' },
        albumId: { type: 'uuid', references: '"albums"', onDelete: 'CASCADE' }

    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('songs');
    pgm.dropTable('albums');
};
