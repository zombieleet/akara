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
    applyButtonConfig
} = require("../../js/VideoControl.js");

const {
    dataUriToBlobUri
} = require("../../js/Util.js");

const podcastChannelWidgetHandler = require("../../js/Podcast/PodcastChannelWidgetHandlers.js");

/**
   build the podcasters channel widget,
   handlers for this widget are bound to podcastChannelWidgetHandler Object
**/

const podcastsChannelWidget = () => {
    const pwidget = document.createElement("ul");
    // folder === open
    const channelWidgets = [ "folder" ,  "play" , "download", "uncheck", "times" /*remove/delete a podcast*/ ];


    pwidget.setAttribute("class", "podcast-name-widgets");


    channelWidgets.forEach( widget => {
        const widg = document.createElement("li");
        widg.setAttribute("data-podcat-widget-func", widget);
        widg.setAttribute("data-current-podcast", widget);
        applyButtonConfig(widg, "podcast-buttons", widget);
        widg.addEventListener("click",podcastChannelWidgetHandler[widget].bind(podcastChannelWidgetHandler));
        pwidget.appendChild(widg);
    });
    return pwidget;
};


/**
   build all saved podcast channel
**/

const appendChannelToDom = async pod => {

    const podcastLoadMain = document.querySelector(".podcastload-main");

    const { description, image, title, owner, language, podlink, categories } = pod;

    // remove me after
    if ( ! title )
        return ;

    let li = document.createElement("li");
    let p = document.createElement("p");
    let podcastImage = new Image();

    podcastImage.src = await dataUriToBlobUri(image);
    podcastImage.setAttribute("class", "podcast-image");

    li.setAttribute("data-url", podlink);
    li.setAttribute("data-podcast", title);
    li.setAttribute("data-podcast-descr", description.long);
    li.setAttribute("data-podcast-categories", categories.join(" "));

    p.setAttribute("class", "podcaster-podcast-name");
    p.textContent = title;

    li.appendChild(p);
    li.appendChild(podcastImage);

    li.appendChild(podcastsChannelWidget());

    podcastLoadMain.appendChild(li);

};

module.exports.appendChannelToDom = appendChannelToDom;

module.exports.createPodcast = podcasts => {

    const nopod = document.querySelector(".nopoadcast");

    console.log(podcasts);

    if ( nopod )
        nopod.remove();

    Object.keys(podcasts).forEach( pod => appendChannelToDom(podcasts[pod]));
};
