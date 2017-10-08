const {
    PLAYLIST_FILE,
    PODCAST
} = require("./constants.js");

const SHORTCUT_KEYS = require("./shotcutkeys.json");

const playlistFile = PLAYLIST_FILE();
const podcast = PODCAST();

module.exports = {
    playlist: {
        file: playlistFile
    },
    podcast,
    shortcut: SHORTCUT_KEYS
};
