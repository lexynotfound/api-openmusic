const prisma = require('../../services/prisma');
const songSchema = require('../../validators/songsValid');

const addSong = async ( request, h ) => {
    const { error, value } = songSchema.validate(request, payload);
    if (error) {
        return h.response({ status: 'fail', message: error.details[0].message })
    };

    const newSong = await prisma.songs.create({
        data: value,
    });

    // return response
    return h.response({ status: 'success', data:{songId: newSong.id}}).code(200)
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

    return h.response({ status: 'success', data: { songs } }).code(200);
};

// get songs byid
const getSongById = async ( request, h ) => {
    const { id } = request.params;
    const song =  await prisma.songs.findUnique({ where: { id } });

    if (!song) {
        return h.response({ status: 'fail', message: 'Song not found '}).code(404);
    }

    return h.response({ status: 'success', data: { song } }).code(200);
}

const updateSongById = async ( request, h ) => {
    const { id } = request.params;
    const { error, value } = songSchema.validate(request, payload);

    if (error){
        return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    await prisma.songs.update({
        where: { id },
        data: value,
    });

    return h.response({ status: 'success', message: 'song updated'}).code(200);

};

const deleteSongById = async ( request, h ) => {
    const { id } = request.params;
    await prisma.songs.delete({where: { id } });
    return h.response({ status: 'success', message: 'song deleted' }).code(200);

};

module.exports = { addSong, getSongs, getSongById, updateSongById, deleteSongById };