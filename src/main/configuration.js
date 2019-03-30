
"use strict";

const {
    USER_POSTERS_LOCATION,
    PLAYLIST_FILE,
    PODCAST,

    requireSettingsPath,
    createNonExisting
} = require("./constants.js");


const playlistFile = createNonExisting({ type: "file"      , name: "playlist.json" });
const posters      = createNonExisting({ type: "directory" , name: "posters"       });
const podcast      = createNonExisting({ type: "file"      , name: "podcast.json"  });
const plugins      = createNonExisting({ type: "file"      , name: "plugins.json"  });

module.exports = {
    playlist: {
        file: playlistFile
    },
    podcast,
    posters
};
