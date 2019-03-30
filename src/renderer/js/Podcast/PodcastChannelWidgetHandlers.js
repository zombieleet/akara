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
        dialog,
        require: _require
    }
} = require("electron");

const {
    podcastPlayEvent,
    podcastDownloadEvent,
    podcastRemoveEvent
} = require("../../js/Podcast/PodcastEventHandlers.js");

const {
    removepodcast,
    dataUriToBlobUri
} = require("../../js/Util.js");

const podcastWindow         = require("../../js/Podcast/PodcastWindowHome.js");
const { applyButtonConfig } = require("../../js/VideoControl.js");


const podson = require("podson");
const url    = require("url");


/**
   fire up this spinner when searching the internet
   for a podcast Channel
**/

const spinOnPodLoad = () => {

    let podcasterSection = document.querySelector(".podcastload-podcaster");
    let spinner = document.querySelector(".podcast-spinner");
    let podcasterPod = document.querySelector(".podcaster-podcast");
    let podcastLoadMain = document.querySelector(".podcastload-main");


    if ( spinner )
        spinner.remove();

    if ( podcasterPod )
        podcasterPod.remove();


    podcasterSection.style.display = "block";
    podcastLoadMain.style.display = "none";

    let spin = document.createElement("i");

    spinner = document.createElement("div");
    spinner.setAttribute("class", "podcast-spinner");

    spin.setAttribute("class", "fa fa-spinner fa-pulse fa-5x");

    spinner.appendChild(spin);

    podcasterSection.appendChild(spinner);

    return spinner;
};



/**
   widgets located at the podcast channel podcasts
**/
const podAudioWidget = () => {

    let widgetP = document.createElement("div");

    let playI = document.createElement("i"),
        downloadI = document.createElement("i"),
        removePodI = document.createElement("i");

    playI.setAttribute("class", "fa fa-play-circle");
    downloadI.setAttribute("class", "fa fa-download");
    removePodI.setAttribute("class", "fa fa-times-circle");

    playI.addEventListener("click", podcastPlayEvent);
    downloadI.addEventListener("click", podcastDownloadEvent);
    removePodI.addEventListener("click", podcastRemoveEvent);

    [ playI, downloadI, removePodI ].
        forEach( wid => widgetP.appendChild(wid));

    widgetP.setAttribute("class", "podaudio-widget");

    return widgetP;
};


/**
   append all the podcast channel to the DOM
**/

const appendPodcastToDOM = async (result,podB) => {

    const podcastParent = document.querySelector(".podcastload-podcaster");
    const ul = podcastParent.querySelector(".podcaster-podcast") || document.createElement("ul");
    const { episodes, title } = result;
    const _savedpod = podB[title];

    ul.setAttribute("class", "podcaster-podcast");

    podcastParent.appendChild(ul);

    for ( let episode of episodes ) {

        const li = document.createElement("li");
        const span = document.createElement("span");
        const image = new Image();
        const { title: podTitle , duration, enclosure } = episode;

        if ( ! enclosure )
            continue;

        const { filesize, url } = enclosure;

        delete episode.image;

        li.setAttribute("class", "podcast-audio");
        li.setAttribute("podcast-duration", duration);
        li.setAttribute("podcast-title", podTitle);
        li.setAttribute("podcast-filesize", filesize);
        li.setAttribute("podcast-url", url);

        _savedpod.episode = episode;

        li.setAttribute("podcast-metadata", JSON.stringify(_savedpod));

        span.setAttribute("class", "podcast-title");

        span.textContent = podTitle.length > 48 ?
            podTitle.replace(
                new RegExp(podTitle.substr(48 + 1, podTitle.length)), "..."
            )
            : podTitle;

        image.setAttribute("class", "podcast-image");

        image.src = await dataUriToBlobUri(_savedpod.image);

        li.appendChild(span);
        li.appendChild(image);
        li.appendChild(podAudioWidget());
        ul.appendChild(li);
    }
};




/**
   widgets that handles operation on the podcaster channel ( NOTE: Not podcasts in a channel )

   folder: opens all podcasts in that podcast channel
   play: sends an ipc message to the main window it the id of 1, the argument passed contains all
   the podcast in this channel
   uncheck: to check a podcast channel
   check: to check a podcast channel
   times: to delete a podcast
**/



const podcastChannelWidgetHandler = Object.defineProperties( {} , {

    folder: {

        async value(evt,appendToDom = true) {

            const { podcast: _podcastPodcast } = _require("./configuration.js");
            const pod = require(_podcastPodcast);

            let podLink = evt.target.parentNode.parentNode.getAttribute("data-url");
            let result;

            if ( ! url.parse(podLink).protocol )
                podLink = podLink.replace(/^/,"http://");

            let spin = appendToDom ? spinOnPodLoad() : false;

            try {
                result = await podson.getPodcast(podLink);
            } catch (ex) {
                result = ex;
            }

            if ( spin ) {
                spin.remove();
            }

            if ( Error[Symbol.hasInstance](result) ) {

                podcastWindow.podcasthome();

                return dialog.showErrorBox(
                    "Bad Internet Connection",
                    "Check your Internet connectivity"
                );
            }

            if ( appendToDom ) {
                return appendPodcastToDOM(result, pod);
            }

            return result;
        }
    },
    play: {
        async value(evt) {
            const allpodcasts = await this.folder(evt, false);
            ipc.sendTo(1,"akara::podcast:play", allpodcasts, "podder");
        }
    },
    download: {
        value(evt) {
        }
    },
    uncheck: {
        value(evt) {

            const target = evt.target;

            target.removeAttribute("class");

            if ( target.getAttribute("data-current-podcast") === "check" ) {
                target.setAttribute("data-current-podcast", "uncheck");
                applyButtonConfig(target, "podcast-buttons", "uncheck");
                return;
            }

            target.setAttribute("data-current-podcast", "check");
            applyButtonConfig(target, "podcast-buttons", "check");
            return;
        }
    },
    check: {
        value(evt) {
            const target = evt.target;
            console.log("in d wtf");
            target.setAttribute("data-current-podcast", "uncheck");
            applyButtonConfig(target, "podcast-buttons", "uncheck");
        }
    },
    times: {
        value(evt) {
            const channel = evt.target.parentNode.parentNode;
            removepodcast(channel.getAttribute("data-podcast"));
            channel.remove();
        }
    }
});

module.exports = podcastChannelWidgetHandler;
