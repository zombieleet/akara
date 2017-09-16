const {
    PLAYLIST_FILE
} = require("./constants.js");

const SHORTCUT_KEYS = require("./shotcutkeys.json");

const playlistFile = PLAYLIST_FILE();

module.exports = {
    playlist: {
        file: playlistFile
    },
    shortcut: SHORTCUT_KEYS
};
