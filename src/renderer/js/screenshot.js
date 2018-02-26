; ( () => {
    "use strict";
    const {
        desktopCapturer,
        ipcRenderer: ipc,
        remote : {
            BrowserWindow,
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
    const screenshotTimeout = document.querySelector(".screenshot-delay-ms");

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


    const screenshot = (options,checkType) => {

        getCurrentWindow().minimize();
        //{ types, thumbnailSize }
        desktopCapturer.getSources(options, (error, sources) => {

            if ( error ) {
                dialog.showErrorBox("cannot take screenshot", error);
                return;
            }

            sources.forEach( source => {

                if ( ! checkType(source) )
                    return ;
                
                if ( ! screenshotTimeout.disabled ) {
                    setTimeout( savePath, screenshotTimeout.valueAsNumber * 1000);
                    return ;
                }
                
            });

        });
    };


    const handleScreenShot = Object.defineProperties( {} , {
        entireScreen: {
            value() {
                screenshot({ types: ["screen"]}, source => {

                    if ( source.name !== "Entire screen" )
                        return false;

                    ipc.once("akara::screenshot:get_file", evt => {
                        const childWindowId = getCurrentWindow().getChildWindows()[0].webContents.id;
                        ipc.sendTo(childWindowId,"akara::screenshot:send_file", source.thumbnail.toPng());
                    });
                    return true;
                });
            }
        },
        activeWindow: {
            value() {

                // const screenSize = screen.getPrimaryDisplay().workAreaSize;
                // const maxDimension = Math.max(screenSize.width, screenSize.height);

                // const thumbnailSize = {
                //     width: maxDimension * window.devicePixelRatio,
                //     height: maxDimension * window.devicePixelRatio
                // };

                screenshot({ types: ["window"], thumbnailSize: { width: 100, height: 300 } } , source => {

                    if ( source.name !== "Akara" )
                        return false;

                    ipc.once("akara::screenshot:get_file", evt => {

                        let screenshotWindow ;

                        for ( screenshotWindow of BrowserWindow.getAllWindows() ) {
                            if ( screenshotWindow.isFocused() === true )
                                break;
                        }

                        const childWindowId = getCurrentWindow().getChildWindows()[0].webContents.id;

                        screenshotWindow.capturePage( nImage => {
                            ipc.sendTo(childWindowId,"akara::screenshot:send_file", nImage.toPng());
                        });

                    });

                    return true;
                });
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
