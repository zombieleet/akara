; ( () => {
    "use strict";
    const {
        desktopCapturer,
        ipcRenderer: ipc,
        remote : {
            getCurrentWindow,
            dialog,
            screen,
            require: _require
        }

    } = require("electron");

    const {
        createNewWindow
    } = _require("./newwindow.js");

    const path = require("path");

    const screenshotCancel = document.querySelector(".screenshot-cancel");
    const windowClose = document.querySelector(".screenshot-close");
    const screenshotOk = document.querySelector(".screenshot-ok");

    const savePath = () => {
        const chooseSavePathWindow = {
            title: "savepath",
            parent: getCurrentWindow(),
            minimizeable: true,
            maximizable: true,
            resizable: true,
            width: 600,
            height: 300
        };
        const html = `${chooseSavePathWindow.title}.html`;
        createNewWindow(chooseSavePathWindow, html);
    };


    const screenshot = (types,thumbnailSize) => {

        getCurrentWindow().minimize();

        desktopCapturer.getSources({ types, thumbnailSize }, (error, sources) => {

            if ( error ) {
                dialog.showErrorBox("cannot take screenshot", error);
                return;
            }

            sources.forEach( source => {

                if ( source.name !== "Akara" )
                    return ;

                ipc.once("akara::screenshot:get_file", evt => {
                    console.log(source.thumbnail.toPng());
                    const childWindowId = getCurrentWindow().getChildWindows()[0].webContents.id;
                    ipc.sendTo(childWindowId,"akara::screenshot:send_file", source.thumbnail.toPng());
                });
                savePath();
            });

        });
    };


    const handleScreenShot = Object.defineProperties( {} , {
        entireScreen: {
            value() {
                const screenSize = screen.getPrimaryDisplay().workAreaSize;
                const maxDimension = Math.max(screenSize.width, screenSize.height);
                screenshot(["window"], {
                    width: maxDimension * window.devicePixelRatio,
                    height: maxDimension * window.devicePixelRatio
                });
            }
        },
        activeWindow: {
            value() {
            }
        },
        selectRegion: {
            value() {
            }
        }
    });



    screenshotCancel.addEventListener("click", () => {
        getCurrentWindow().close();
    });

    windowClose.addEventListener("click", () => {
        getCurrentWindow().close();
    });


    screenshotOk.addEventListener("click", () => {
        const form = document.querySelector("form");

        let checkedElement = Array.from(form.querySelectorAll("input")).
              filter( el => el.checked );

        checkedElement = checkedElement[0];

        try {
            handleScreenShot[checkedElement.getAttribute("class")]();
        } catch(ex) {
            console.log(ex);
        }

    });

})();
