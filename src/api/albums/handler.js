const { request } = require('http');
const prisma = require('../../services/prisma');
const albumSchema = require('../../validators/albumsValid')

const addAlbum = async (request, h) => {
    const { error, value } = albumSchema.validate(request.payload);
    if (error) {
        // Respond with a detailed validation error message
        return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
        const { name, year } = value;

        // Create new album in the database
        const newAlbum = await prisma.album.create({
            data: { name, year },
        });

        return h.response({ status: 'success', data: { albumId: newAlbum.id } }).code(201);
    } catch (err) {
        // Log the error and provide detailed feedback
        console.error('Error creating album:', err);
        return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
    }
};

const getAlbums = async ( request, h ) => {
    const { name, year } = request.query;

    const albums = await prisma.album.findMany({
        where: {
            AND: [
                name ? { name: { contains: title, mode: 'insensitive'} } : {},
                year ? { year: { contains: performer, mode: 'insensitive'} } : {},
            ],
        },
    });

    if(!albums){
            return h.response({ status: 'fail', message: 'No albums found' }).code(404);
    };

    return h.response({ status: 'success', data: { albums } }).code(200);
};


const getAlbumById =  async (request, h) => {
    const { id } = request.params;
    const album = await prisma.album.findUnique({
        where: { id },
        include: { songs: true },
    });

    if (!album) {
        return h.response({ status: 'fail', message: 'Album not found '}).code(404);
    }

    return h.response({ status: 'success', data: {album}}).code(200);
};

const updateAlbumById = async (request, h) => {
    const { id } = request.params;
    const { error, value } = albumSchema.validate(request.payload);
    if (error) {
        return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    await prisma.album.update({
        where: { id },
        data: { 
            name: value.name, 
            year: value.year
        },
    });

    return h.response({ status: 'success', message: 'Album Updated'}).code(200)
};

// updated album
const deleteAlbumById = async (request, h) => {
    const { id } = request.params;
    await prisma.album.delete({
        where: { id }
    });
    
    return h.response({ status: 'success', message: 'Album deleted' }).code(200);
};

(async () => {
    const { nanoid } = await import('nanoid');
})();

module.exports = { addAlbum, getAlbumById, updateAlbumById, deleteAlbumById, getAlbums };

