"use strict";

const fs = require("fs");

const { validatePaths } = require("../Plugin/Util.js");

const {
    playlistSave,
    playlistLoad,
    deletePlaylist
} = require("../Playlist/PlaylistUtil.js");

const {
    ipcRenderer: ipc
} = require("electron");

// TODO: load already added playlist into this.playlists{internal || external}

const playlistPlugin = new(class Playlist {

    constructor() {
        this.playlists = {
            internal: [ // { title, files: [] }
            ],
            external: []
        };

        this.internalPlaylist = {};
        this.externalPlaylist = {};
    }
})();

Object.defineProperty( playlistPlugin.internalPlaylist , "add", {

    value({title,files,notify,ordered}) {

        if ( typeof(title) !== "string" )
            return Promise.reject(`expect title of playlist to be a string but got ${typeof(title)}`);

        const playlistFiles = validatePaths(files);

        let titleIdx = playlistPlugin.playlists.internal.findIndex( ({ title: __internalTitle }) => __internalTitle === title);

        if ( titleIdx === -1 ) {
            playlistPlugin.playlists.internal.push({ title, playlistFiles: [] });
            titleIdx = playlistPlugin.playlists.internal.length - 1;
        }

        for ( let pfile of playlistFiles ) {
            try {
                if ( ! fs.existsSync(pfile) && ordered )
                    throw `${pfile} does not exists`;
                playlistPlugin.playlists.internal[titleIdx].playlistFiles.push(pfile);
            } catch(ex) {
                if ( ordered )
                    return Promise.reject(ex);
            }
        }

        playlistSave(
            title,
            playlistPlugin.playlists.internal[titleIdx].playlistFiles,
            notify
        );

        return Promise.resolve();
    }
});

Object.defineProperty( playlistPlugin.internalPlaylist , "remove", {
    value(title) {
        if ( typeof(title) !== "string" )
            return Promise.reject(`expect title to be of type string but got ${typeof(title)}`);
        playlistPlugin.playlists.internal = playlistPlugin.playlists.internal.filter( ({ title: __internalTitle }) => __internalTitle !== title);
        deletePlaylist(title);
        return Promise.resolve();
    }
});

Object.defineProperty( playlistPlugin.internalPlaylist , "appendToDom", {
    value( title ) {
        if ( typeof(title) !== "string" )
            return Promise.reject(`expect title to be of type string but got ${typeof(title)}`);
        const filteredPlaylistName = playlistLoad(title);
        ipc.sendTo(1,"akara::loadplaylist", filteredPlaylistName , title);
        return Promise.resolve();
    }
});

module.exports = playlistPlugin;
