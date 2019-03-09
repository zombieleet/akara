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
        getCurrentWindow
    }
} = require("electron");

const {
    computeByte,
    loadpodcast
} = require("../../js/Util.js");

const dodo    = require("../../js/Podcast/PodcastUtils.js");
const podcast = require("../../js/Podcast/PodcastWindowHome.js");


const ipcPodcastHandlers = Object.defineProperties( {}, {

    podcastDownloadStarted: {value(target) {}},

    podcastDownloadEnded: {

        value(targetPNode,urlFromMain,urlFromRenderer) {

            if ( urlFromMain !== urlFromRenderer ) return;

            const downloadIndicator        = targetPNode.querySelector(".podcast-downloading");
            const downloadPercentIndicator = downloadIndicator.querySelector(".podcast-downloading-percent");

            downloadPercentIndicator.textContent = "Downloading is complete";

            setTimeout( () => {
                downloadIndicator.remove();
            },5000);
        }
    },

    podcastDownloadingState: {

        value(targetPNode,state,item,urlFromMain,urlFromRenderer) {
            if ( urlFromMain !== urlFromRenderer ) return;
            if ( state === "interrupted" ) {
                const downloadPercentIndicator = targetPNode.querySelector(".podcast-downloading-percent");
                downloadPercentIndicator.textContent = "Download was interrupted. This download will be started automatically";
            }

        }
    },

    podcastBytes: {
        value(targetPNode,rbyte,tbyte,urlFromMain,urlFromRenderer) {
            if ( urlFromMain !== urlFromRenderer ) return;
            const downloadTotalBytes = targetPNode.querySelector(".podcast-downloading-totalbytes");
            const { measurement: rbyteM , unit: rbyteU } = computeByte(rbyte);
            const { measurement: tbyteM , unit: tbyteU } = computeByte(tbyte);
            downloadTotalBytes.textContent = `${rbyteM} ${rbyteU}/${tbyteM} ${tbyteU}`;
        }
    },

    podcastPercentBytes: {
        value(targetPNode,rbyte,tbyte,urlFromMain,urlFromRenderer) {
            if ( urlFromMain !== urlFromRenderer ) return;
            const downloadPercentIndicator = targetPNode.querySelector(".podcast-downloading-percent");
            const { measurement: rbyteM } = computeByte(rbyte);
            const { measurement: tbyteM } = computeByte(tbyte);
            downloadPercentIndicator.textContent = `${((rbyteM/tbyteM) * 100).toPrecision(4)}%`;
        }
    }
});


const createDownloadingInidcators = podcastParentNode => {

    const downloadIndicator      = document.createElement("div");
    const downloadStateIndicator = document.createElement("i");
    const downloadedPercentage   = document.createElement("p");

    const downloadBytes          = document.createElement("p");

    downloadIndicator.setAttribute("class", "podcast-downloading");
    downloadStateIndicator.setAttribute("class", "fa fa-pause");
    downloadedPercentage.setAttribute("class", "podcast-downloading-percent");

    downloadBytes.setAttribute("class", "podcast-downloading-totalbytes");

    downloadedPercentage.textContent = "About to start downloading";

    downloadIndicator.appendChild(downloadStateIndicator);
    downloadIndicator.appendChild(downloadedPercentage);

    downloadIndicator.appendChild(downloadBytes);
    downloadIndicator.appendChild(downloadBytes);

    podcastParentNode.appendChild(downloadIndicator);
};


module.exports.podcastPlayEvent = ({target}) => {
    const podcastmetadata = target.parentNode.parentNode.getAttribute("podcast-metadata");
    ipc.sendTo(1, "akara::podcast:play",podcastmetadata, "podder");
};

module.exports.podcastDownloadEvent = ({target}) => {

    const podcastmetadata = target.parentNode.parentNode.getAttribute("podcast-metadata");
    const { episode: { enclosure: { url: urlFromRenderer } } } = JSON.parse(podcastmetadata);
    const { webContents } = getCurrentWindow();

    const podcastToDownload = target.parentNode.parentNode;

    createDownloadingInidcators(podcastToDownload);


    ipc.once("download::started",  (evt,item,urlFromMain) => ipcPodcastHandlers.podcastDownloadStarted(podcastToDownload,urlFromMain,urlFromRenderer));
    ipc.once("download::complete", (evt,fpath,urlFromMain) => ipcPodcastHandlers.podcastDownloadEnded(podcastToDownload,urlFromMain,urlFromRenderer));

    ipc.on("download::state", (evt,state,item,urlFromMain) => ipcPodcastHandlers.podcastDownloadingState(podcastToDownload,state,urlFromMain,urlFromRenderer));
    ipc.on("download::computePercent", (evt,rBytes,tBytes,urlFromMain) => ipcPodcastHandlers.podcastPercentBytes(podcastToDownload,rBytes,tBytes,urlFromMain,urlFromRenderer));
    ipc.on("download::totalAndGottenBytes", (evt,rBytes,tBytes,urlFromMain) => ipcPodcastHandlers.podcastBytes(podcastToDownload,rBytes,tBytes,urlFromMain,urlFromRenderer));

    ipc.send("download::init", urlFromRenderer , webContents.id );
};

module.exports.podcastWindowWidgetHandler = evt => {

    const target = evt.target;

    if ( ! target.classList.contains("podcast-icon-operation") )
        return ;

    const method = target.parentNode.getAttribute("class");

    try {
        podcast[method]();
    } catch(ex) {
        console.log(ex);
        console.log("%s not implemented yet", method);
    };

};

module.exports.domLoadedLoadPodcast = evt => {

    const podcasts = loadpodcast();
    const podload = document.querySelector(".podcastload-main");

    if ( ! Object.keys(podcasts).length ) {
        let nopod = document.createElement("p");
        nopod.classList.add("nopoadcast");
        nopod.innerHTML = "You don't have any podcast";
        podload.appendChild(nopod);
        return ;
    }
    dodo.createPodcast(podcasts);
    return ;
};

module.exports.podcastRemoveEvent = evt => evt.target.parentNode.parentNode.remove();
