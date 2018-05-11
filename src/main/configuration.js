const {
    PLAYLIST_FILE,
    PODCAST,
    requireSettingsPath,
    USER_POSTERS_LOCATION
} = require("./constants.js");


const playlistFile = PLAYLIST_FILE();
const podcast = PODCAST();
const posters = USER_POSTERS_LOCATION();

module.exports = {
    playlist: {
        file: playlistFile
    },
    podcast,
    posters
};
