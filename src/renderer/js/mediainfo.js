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

    const {
        handleWindowButtons,
        getMetaData
    } = require("../js/util.js");

    const mediaMin = document.querySelector(".window-min");
    const mediaMax = document.querySelector(".window-max");
    const mediaClose = document.querySelector(".window-close");

    
    ipc.sendTo(1, "akara::video::currentplaying", getCurrentWindow().webContents.id);
    
    ipc.on("akara::video::currentplaying:src", async ( evt, data ) => {
        console.log(decodeURIComponent(url.parse(data).path));
        await getMetaData(decodeURIComponent(url.parse(data).path));
    });


    
    handleWindowButtons({ close: mediaClose, min: mediaMin, max: mediaMax });

})();
