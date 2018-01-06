; ( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            dialog,
            getCurrentWindow
        }
    } = require("electron");

    const url = require("url");

    const { handleWindowButtons } = require("../js/util.js");

    const mediaMin = document.querySelector(".window-min");
    const mediaMax = document.querySelector(".window-max");
    const mediaClose = document.querySelector(".window-close");

    const getAllTags = () => {

        const jsmediaTags = require("jsmediatags");
        
        ipc.sendTo(1, "akara::video::currentplaying");
        
        ipc.once("akara::video::currentplaying:src", ( evt, src ) => {

            const mediaTagReader = new jsmediaTags.Reader(
                decodeURIComponent(url.parse(src).path)
            );

            mediaTagReader.setTagsToRead(["picture"])
                .read({
                    onSuccess({ tags }) {
                        console.log(tags);
                    },
                    onError(error) {
                        console.log(error);
                    }
                });
        });
    };

    handleWindowButtons({ close: mediaClose, min: mediaMin, max: mediaMax });

})();
