; ( () => {

    const {
        ipcRenderer: ipc,
        remote: {
            getCurrentWindow,
            dialog,
            require: _require
        }
    } = require("electron");
    
    const { createNewWindow: settingsWindow } = _require("./newwindow.js");

    const { handleWindowButtons } = require("../js/util.js");


    const settingsMin = document.querySelector(".window-min");
    const settingsMax = document.querySelector(".window-max");
    const settingsClose = document.querySelector(".window-close");
    const settingsValue = document.querySelector(".settings-values");
    const textSearch = document.querySelector(".search");


    const handleAkaraSettings = Object.create({});


    handleAkaraSettings.poster = () => {

        const poster = {
            title: "poster",
            maximizable: false,
            resizable: false,
            minimizable: false,
            center: true
        };

        settingsWindow(poster, "settings/poster.html");
    };

    handleAkaraSettings.powersettings = () => {
        const power = {
            title: "power",
            maximizable: false,
            resizable: false,
            minimizable: false,
            width: 500,
            height: 460,
            center: true
        };

        settingsWindow(power, "settings/powermanagement.html");
    };

    handleAkaraSettings.playbackrate = () => {
        const playbackrate = {
            title: "playbackrate",
            maximizable: false,
            resizable: false,
            minimizable: false,
            width: 500,
            height: 460,
            center: true
        };
        settingsWindow(playbackrate, "settings/playbackrate.html");
    };

    handleAkaraSettings.filter = () => {
        const filter = {
            title: "filter",
            maximizable: false,
            resizable: false,
            minimizable: false,
            width: 408,
            height: 1000
        };
        settingsWindow(filter, "filter.html");
    };

    handleAkaraSettings.share = () => {
        const share = {
            title: "share",
            maximizable: false,
            resizeable: false,
            minimizable: false,
            width: 500,
            height: 450,
            center: true
        };
        settingsWindow(share, "settings/share.html");
    };

    handleAkaraSettings.volume = () => {
        const volume = {
            title: "volume",
            maximizable: false,
            resizeable: false,
            minimizable: false,
            width: 500,
            height: 450,
            center: true
        };
        settingsWindow(volume, "settings/volume.html");
    };
    
    settingsValue.addEventListener("click", evt => {
        const { target } = evt;

        if ( ! target.hasAttribute("data-fire") )
            return ;

        try {
            handleAkaraSettings[target.getAttribute("data-fire")](evt);
        } catch(ex) {
            console.log(ex);
            dialog.showErrorBox("Not Yet Implemented", `${target.textContent} has not yet be implemented`);
        }
    });

    handleWindowButtons({ close: settingsClose, min: settingsMin, max: settingsMax });

})();
