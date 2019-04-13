"use strict";

const { validatePaths , readSubtitleFile } = require("../Plugin/Util.js");
const { handleLoadSubtitle } = require("../../js/VideoHandlers.js");

module.exports = class SubtitlePlugin {

    constructor() {
        this.subtitles = [];
    }

    add( subtitles ) {

        const subtitlePaths = validatePaths(subtitles);

        let i = 0;

        for ( let sub of subtitlePaths ) {
            ; ( async () => {
                const fPath = await handleLoadSubtitle(sub , async filePath => {
                    const result = await readSubtitleFile(filePath);
                    return result;
                });
                if ( fPath ) this.subtitles.push({ id: i++ , path: fPath });
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
               ) return reject(
                   `all elements in the array should be a number but got ${typeof(id[idxNum])} at index ${idxNum}`
               );

            if ( typeof(id) !== "number" ) return reject(
                `expect id to be a number but got typeof ${typeof(id)}`
            );

            id = isArray ? id : [ id ];

            const { ipcRenderer, remote: { getCurrentWindow } } = this.electron;
            const { webContents } = getCurrentWindow();

            ipcRenderer.once("plugin::subtitle:no:subtitle", () => {
                return reject("No subtitle have been added to the dom");
            });

            ipcRenderer.once("plugin::subtitle:file:removed", (evt,subtitle) => {
                console.log(subtitle, "removed");
                return resolve(subtitle);
            });

            ipcRenderer.sendTo(1, "plugin::remove:subtitle:file", webContents.id , id);
        });
    }

};
