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
    ipcRenderer: ipc
} = require("electron");

const {
    downloadWindow,
    downloadFile,
    loadpodcast
} = require("../../js/Util.js");

const dodo    = require("../../js/Podcast/PodcastUtils.js");
const podcast = require("../../js/Podcast/PodcastWindowHome.js");

module.exports.podcastPlayEvent = ({target}) => {
    //const podcasturl = target.parentNode.parentNode.getAttribute("podcast-url");
    const podcastmetadata = target.parentNode.parentNode.getAttribute("podcast-metadata");
    ipc.sendTo(1, "akara::podcast:play",podcastmetadata, "podder");
};

module.exports.podcastDownloadEvent = ({target}) => {
    const podcastmetadata = target.parentNode.parentNode.getAttribute("podcast-metadata");
    const { episode: { enclosure: { url } } } = JSON.parse(podcastmetadata);
    const win = downloadWindow();
    downloadFile(url, win);
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
