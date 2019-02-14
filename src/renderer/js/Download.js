/* AKM is a highly customizable media player built with electron
   Copyright (C) 2016  Victory Osikwemhe (zombieleet)

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


"use strict";

const {
    ipcRenderer: ipc,
    remote: {
        BrowserWindow,
        getCurrentWindow,
        require: _require
    }
} = require("electron");

const {
    downloadFile,
    computeByte,
    resumeDownloading
} = require("../js/Util.js");


// const close         = document.querySelector(".download-close");
// const filename      = document.querySelector(".akara-download-filename");
// const downByte      = document.querySelector(".akara-download-meter");
// const unknownByte   = document.querySelector(".akara-unknown-download-meter");

// const downByPercent = document.querySelector(".akara-downloading-percent");
// const downloadState = document.querySelector(".akara-download-state");

// const currentByte   = document.querySelector(".akara-currentByte");
// const totalByte     = document.querySelector(".akara-totalByte");

// const cancel       = document.querySelector(".akara-download-cancel");
// const pause        = document.querySelector(".akara-download-pause");
// const resume       = document.querySelector(".akara-download-resume");
// const restart      = document.querySelector(".akara-download-restart");


/**
 *
 *
 * hide or show pause resume and restart
 *  buttons
 *
 *
 **/

// const hide = ({_pause,_resume,_restart}) => {
//     pause.hidden = _pause;
//     resume.hidden = _resume;
//     restart.hidden = _restart;
// };



/**
 *
 *
 *  download::state event listener will be trigerred
 *  whenever the state of the download is updated
 *
 **/

// ipc.on("download::state", (event,state) => {

//     downloadState.textContent = state === "progressing"
//         ? "Downloading"
//         : state;

//     switch(state) {
//     case "interrupted":
//         pause.hidden = true;
//         cancel.hidden = true;
//         resume.hidden = true;
//         restart.hidden = false;
//         break;
//     case "progressing":
//         pause.disabled = false;
//         cancel.disabled = false;
//         resume.hidden = true;
//         restart.hidden = true;
//         break;
//     case "completed":
//         pause.disabled = true;
//         cancel.disabled = true;
//         resume.hidden = false;
//         restart.hidden = false;
//         break;
//     case "cancelled":
//         restart.hidden = false;
//         resume.hidden = true;
//         pause.hidden = false;
//         cancel.hidden = true;
//         break;
//     default:
//         // do nothing
//     }
// });


/**
 *
 *
 * download::gottenByte event listener will be trigerred
 * each time a byte is downloaded
 *
 **/


ipc.on("download::gottenByte", (event,bytes) => {
    currentByte.textContent = computeByte(bytes);
});


// /**
//  *
//  *
//  *
//  * download::filename event is trigerred whenever
//  *  the downloads starts, fname is the name of the file
//  *
//  **/

// ipc.on("download::filename", (event,fname) => {
//     filename.textContent = fname;
// });


/**
 *
 *
 *
 * download::totalbyte event is trigerred whenever the download starts
 *  bytes contains the totalbyte of the file
 *
 **/

ipc.on("download::totalbyte", (event,bytes) => {

    /**
     * when byte is 0 don't do a percent download
     * just do an unknown byte download
     **/

    if ( bytes === 0 ) {
        totalByte.setAttribute("style", "display: hidden;");
        return ;
    }

    totalByte.textContent = computeByte(bytes);
});


// ipc.on("akara::downloadPath", (evt,url,cb) => {
//     downloadURL(url,getCurrentWindow(),cb);
// });

/**
 *
 * download::computePercent calculates
 * the percentage of receivedByte to totalByte
 *
 **/

ipc.on("download::computePercent", (event,rByte,tByte) => {

    if ( tByte === 0 ) {
        unknownByte.setAttribute("data-unknown-byte", "true");
        return ;
    }


    if ( unknownByte.hasAttribute("data-unknown-byte") ) {
        unknownByte.removeAttribute("data-unknown-byte");
    }

    const percent = Math.trunc(( ( rByte / tByte ) * 100 ));
    const percentWidth = percent + "%";
    downByPercent.textContent = percentWidth;
    downByte.setAttribute("style", `width: ${percentWidth};display: block`);

});

ipc.on("download::started", (event,webContentId,fileName) => {

    pause.addEventListener("click", () => {
        ipc.send("download::paused");
    });

    close.addEventListener("click", () => {
        ipc.send("download::cancel");
        getCurrentWindow().close();
    });

    restart.addEventListener("click", () => {
        ipc.send("download::restart");
    });

    resume.addEventListener("click", () => {
        ipc.send("download::resume");
    });

    filename.textContent = fileName;

});
