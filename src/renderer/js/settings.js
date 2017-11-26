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


    const settingsMin = document.querySelector(".settings-min");
    const settingsMax = document.querySelector(".settings-max");
    const settingsClose = document.querySelector(".settings-close");
    const settingsValue = document.querySelector(".settings-values");



    const handleAkaraSettings = Object.create({});


    handleAkaraSettings.poster = () => {

        const poster = {
            title: "poster",
            maximizable: false,
            resizable: false,
            minimizable: false,
            center: true
        };

        settingsWindow(poster, "settings/audio/poster.html");
    };

    handleAkaraSettings.powersettings = () => {
        const power = {
            title: "power",
            // maximizable: false,
            // resizable: false,
            // minimizable: false,
            width: 500,
            height: 460,
            center: false
        };

        settingsWindow(power, "settings/powermanagement.html");
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



    settingsClose.addEventListener("click", () => getCurrentWindow().close());
    settingsMin.addEventListener("click", () => {
        ipc.send("akara::newwindow:min");
    });
    settingsMax.addEventListener("click", () => {
        ipc.send("akara::newwindow:max");
    });

    ipc.on("akara::newwindow:ismax", () => {
        settingsMax.classList.remove("fa-window-maximize");
        settingsMax.classList.add("fa-window-restore");
    });

    ipc.on("akara::newwindow:isnotmin", () => {
        settingsMax.classList.remove("fa-window-restore");
        settingsMax.classList.add("fa-window-maximize");
    });


})();
