const { connect } = require('http2');
const prisma = require('../../services/prisma');
const songSchema = require('../../validators/songsValid');
const albums = require('../albums');

const addSong = async ( request, h ) => {
    const { error, value } = songSchema.validate(request.payload);
    if (error) {
        return h.response({ status: 'fail', message: error.details[0].message });
    };

    try {
        const newSong = await prisma.songs.create({
            data: {
                title: value.title,
                performer: value.performer,
                genre: value.genre,
                duration: value.duration,
                year: value.year,
                albums: value.albumId ? {
                    connect: { 
                        id: value.albumId,
                    }, // Connect to existing album
                } : undefined, // Alternatively handle creation or connectOrCreate here if necessary
            },
        });
        // return response
        return h.response(
            { 
                status: 'success', 
                data:{
                    songId: newSong.id, 
                    title: newSong.title,
                    performer: newSong.performer,
                    genre: newSong.genre,
                    year: newSong.year,
                    albums: newSong.albumId
                }}).code(200);
    } catch (err) {
        console.error(err);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500)
    }

};

const getSongs = async ( request, h ) => {
    const { title, performer } = request.query;

    const songs = await prisma.songs.findMany({
        where: {
            AND: [
                title ? { title: { contains: title, mode: 'insensitive'} } : {},
                performer ? { performer: { contains: performer, mode: 'insensitive'} } : {},
            ],
        },
    });

    if(!songs){
            return h.response({ status: 'fail', message: 'No songs founds' }).code(404);
    };

    return h.response({ status: 'success', data: { songs } }).code(200);
};

// get songs byid
const getSongById = async (request, h) => {
    const { id } = request.params;
    const song = await prisma.songs.findUnique({ where: { id } });

    if (!song) {
        return h.response({ status: 'fail', message: 'Song not found' }).code(404);
    }

    return h.response({ status: 'success', data: { song } }).code(200);
};

const updateSongById = async (request, h) => {
    const { id } = request.params;
    const { error, value } = songSchema.validate(request.payload);

    if (error) {
        return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
        // Check if the song exists
        const song = await prisma.songs.findUnique({ where: { id }});
        if(!song){
            return h.response({ status: 'fail', message: 'Song not found' }).code(404);
        }
        const updatedSong = await prisma.songs.update({
            where: { id },
            data: {
                title: value.title,
                performer: value.performer,
                genre: value.genre,
                year: value.year,
                album: value.albumId ? {
                    connect: { 
                        id: value.albumId,
                    }, // Connect to existing album
                } : undefined,
            },
        });
        return h.response({ 
            status: 'success', 
            message: 'Song updated', 
            data:{
                songId: updatedSong.id, 
                title: updatedSong.title,
                performer: updatedSong.performer,
                genre: updatedSong.genre,
                year: updatedSong.year,
                album: updatedSong.albumId,
                }
            }).code(200);
    } catch (e) {
        console.error(e)
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

const deleteSongById = async (request, h) => {
    const { id } = request.params;
    try {
        await prisma.songs.delete({ where: { id } });
        return h.response({ status: 'success', message: 'Song deleted' }).code(200);
    } catch (e) {
        return h.response({ status: 'fail', message: 'Song not found' }).code(404);
    }
};

module.exports = { addSong, getSongs, getSongById, updateSongById, deleteSongById };