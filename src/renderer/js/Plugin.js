"use strict";

const {
    addMediaCb
} = require("../js/DropdownCallbacks.js");

const {
    validatePaths
} = require("../js/Plugin/Util.js");

const electron = require("electron");
const fs       = require("fs");
const path     = require("path");

const SubtitlePlugin = require("../js/Plugin/Subtitle.js");


class Akara {

    constructor() {
        this.electron     = electron;
        this.menus        = this.electron.remote.require("./menu.js");
        this.loadedMedia  = [];
        this.subtitle     = new SubtitlePlugin();
        this.subtitle.electron = this.electron;
    }

    loadMediaFileToDom(paths,forPlaylist) {

        const mediaPaths = validatePaths(paths);

        forPlaylist = ! forPlaylist ? "general" : forPlaylist;

        if ( addMediaCb(mediaPaths,forPlaylist) ) {
            const idx = this.loadedMedia.findIndex( obj => obj.plistName === forPlaylist );
            idx !== -1 ? this.loadedMedia[idx].plist.push(mediaPaths) : this.loadedMedia.push({
                plistName: forPlaylist,
                plist: mediaPaths
            });
            return true;
        }
        return false;
    }

    removeMediaFileFromDom(paths) {
        return new Promise( (resolve,reject) => {
            const mediaPaths = validatePaths(paths);
            this.electron.ipcRenderer.once("plugin::media:file:removed", (evt,removed) => {
                for ( let i = 0 ; i < this.loadedMedia.length ; i++ ) {
                    this.loadedMedia[i].plist = this.loadedMedia[i].plist.filter( x => ! removed.includes(x) );
                }
                this.loadedMedia = this.loadedMedia.filter( ( { plist } ) => plist.length);
                resolve(removed);
            });
            this.electron.ipcRenderer.sendTo(1, "plugin::remove:media:file", this.electron.remote.getCurrentWindow().webContents.id , mediaPaths);
        });
    }

    // getMediaFileDomElement(paths) {

    //     const mediaPaths = Akara.ValidatePaths(paths);

    //     return new Promise( ( resolve , reject ) => {
    //         this.electron.ipcRenderer.once("plugin::media:dom:element", (evt,elements) => {
    //             console.log(elements, "got in");
    //             resolve(elements);
    //         });
    //         this.electron.ipcRenderer.sendTo(1, "plugin::get:media:dom:element", this.electron.remote.getCurrentWindow().webContents.id, mediaPaths);
    //     });
    // }

};


module.exports = Akara;
