; ( () => {

    const {
        ipcRenderer: ipc,
        remote: {
            getCurrentWindow
        }
    } = require("electron");
    
    
    const settingsMin = document.querySelector(".settings-min");
    const settingsMax = document.querySelector(".settings-max");
    const settingsClose = document.querySelector(".settings-close");


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
