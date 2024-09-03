const { request } = require('http');
const prisma = require('../../services/prisma');
const albumSchema = require('../../validators/albumsValid')

const addAlbum = async (request, h) => {
    const { error, value } = albumSchema.validate(request, payload);
    if (error) {
        return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    const { name, year } = value;
    const newAlbum = await prisma.album.create({
        data: {name, year },
    });

    // return response status 201 if succesfull
    return h.response({ status: 'success', data: { albumId: newAlbum.id } }).code(201);
};

const getAlbumById =  async (request, h) => {
    const { id } = request.params;
    const album = await prisma.album.findUnique({
        where: { id },
        include: { songs: ture },
    });

    if (album) {
        return h.response({ status: 'fail', message: 'Album not found '}).code(404);
    }

    return h.response({ status: 'fail', message: 'Album not found '}).code(200);
};

const updateAlbumById = async (request, h) => {
    const { id } = request.params;
    const { error, value } = albumSchema.validate(request.payload);
    if (error) {
        return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    await prisma.album.update({
        where: { id },
        data: { name: value.name, year: value.year},
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

module.exports = { addAlbum, getAlbumById, updateAlbumById, deleteAlbumById };

