"use strict";

const {
    applyButtonConfig
} = require("../../js/video_control.js");

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

const appendChannelToDom = pod => {

    const podcastLoadMain = document.querySelector(".podcastload-main");

    const { description, image, title, owner, language, podlink, categories } = pod;

    // remove me after
    if ( ! title )
        return ;

    let li = document.createElement("li");
    let p = document.createElement("p");
    let podcastImage = new Image();

    podcastImage.src = image;
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
