"use strict";

const { validatePaths } = require("../../js/Plugin/Util.js");
const { handleLoadSubtitle , showSubtitle } = require("../../js/VideoHandlers.js");
const { readSubtitleFile } = require("../../js/Util.js");

module.exports = class SubtitlePlugin {

    constructor() {
        this.subtitles = [];
    }

    /*
     * @param {type} comment.
     * @return {Object}
     */

    add( subtitles ) {

        const subtitlePaths = validatePaths(subtitles);

        for ( let sub of subtitlePaths ) {
            ; ( async () => {
                const fPath = await handleLoadSubtitle(sub , async filePath => {
                    const result = await readSubtitleFile(filePath);
                    return result;
                });
                if ( fPath ) this.subtitles.push({ id: this.subtitles.length , path: fPath });
            })();
        }

        return this;
    }

    removeById(id) {

        let idxNum, isArray;

        return new Promise( ( resolve , reject ) => {

            if ( ( isArray = Array.isArray(id) ) && !
                 id.every( (value,idx) => typeof(value) === "number"
                           ? true
                           : ( () => { idxNum = idx ; return false; } )()
                         )
               ) reject(
                   `all elements in the array should be a number but got ${typeof(id[idxNum])} at index ${idxNum}`
               );

            if ( ! isArray && typeof(id) !== "number" ) reject(
                `expect id to be a number but got typeof ${typeof(id)}`
            );

            id = isArray ? id : [ id ];

            const { ipcRenderer, remote: { getCurrentWindow } } = this.electron;
            const { webContents } = getCurrentWindow();

            ipcRenderer.once("plugin::subtitle:no:subtitle", () => {
                reject("No subtitle have been added to the dom");
            });

            ipcRenderer.once("plugin::subtitle:file:removed", (evt,removedSubs) => {
                for ( let subtitleId of removedSubs ) {
                    this.subtitles = this.subtitles.filter( sub => sub.id !== subtitleId );
                }
                resolve(removedSubs);
            });

            ipcRenderer.sendTo(1, "plugin::remove:subtitle:file", webContents.id , id);
        });
    }

    setShowing(id) {
        if ( typeof(id) !== "number" )
            return Promise.reject(`expect id to be a number but got ${typeof(id)}`);
        showSubtitle(undefined,id);
        return Promise.resolve();
    }

};
