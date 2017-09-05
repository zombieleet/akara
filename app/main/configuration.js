const {
    PLAYLIST_FILE
} = require("./constants.js");

const playlistFile = PLAYLIST_FILE();

module.exports = {
    playlist: {
        file: playlistFile
    }
};
