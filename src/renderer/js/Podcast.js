; ( () => {

    "use strict";
    

    const {
        ipcRenderer: ipc,
        remote: {
            getCurrentWindow,
            require: _require
        }
    } = require("electron");


    const { handleWindowButtons } = require("../js/Util.js");
    const { appendChannelToDom }  = require("../js/Podcast/PodcastUtils.js");
    const podcastEventHandlers    = require("../js/Podcast/PodcastEventHandlers.js");
    const podcast                 = require("../js/Podcast/PodcastWindowHome.js");

    const path = require("path");
    const url  = require("url");
    const http = require("http");
    
    const podcastKey   = new(require("../js/Keyevents.js"));
    const podcastFuncs = document.querySelector("section");

    const min   = document.querySelector("[data-winop=minimize]");
    const max   = document.querySelector("[data-winop=maximize]");
    const close = document.querySelector("[data-winop=close]");

    podcastFuncs.addEventListener("click", podcastEventHandlers.podcastWindowWidgetHandler);
    window.addEventListener("DOMContentLoaded", podcastEventHandlers.domLoadedLoadPodcast);
    close.addEventListener("click", () => getCurrentWindow().close());

    podcastKey.register({
        key: "Escape",
        handler() {
            const modal = document.querySelector(".podcast-modal");
            if ( modal )
                podcast.__removeModal();
        }
    });

    podcastKey.register({
        key: "Enter",
        modifier: [ "ctrlKey" ],
        handler() {
            const modal = document.querySelector(".podcast-modal");
            if ( modal )
                podcast.__savePodcast();
        }
    });

    handleWindowButtons({ close, min, max});

    ipc.on("akara::remove:disable_menu", () => {
        localStorage.removeItem("PODCAST::DISABLE_MENU");
    });

})();
