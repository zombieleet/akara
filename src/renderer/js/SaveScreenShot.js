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
; ( () => {
    
    "use strict";
    
    const {
        ipcRenderer: ipc,
        remote: {
            app,
            dialog,
            getCurrentWindow
        }
    } = require("electron");

    const {
        sendNotification
    } = require("../js/Util.js");


    
    const base64Img = require("base64-img");    
    const path      = require("path");
    const os        = require("os");
    

    const saveShotClose = document.querySelector(".saveshot-close");
    const saveShot      = document.querySelector(".saveshot-save");
    const inputFileName = document.querySelector(".saveshot-name");
    const setPath       = document.querySelector(".saveshot-set_path");

    saveShotClose.addEventListener("click", () => {
        getCurrentWindow().close();
    });


    saveShot.addEventListener("click", () => {

        if ( ! inputFileName.value.length ) {
            dialog.showErrorBox("invalid screnshot name","screenshot name is empty");
            return ;
        }

        const screenshotDirname = setPath.textContent;
        const screenshotBasename = inputFileName.value;

        const dataURI = document.querySelector("img").src;

        base64Img.img( dataURI , screenshotDirname , screenshotBasename , ( err, filePath ) => {

            if ( err )
                return dialog.showErrorBox("Cannot Download Art", "An Error was encountered when download album art");

            return sendNotification({
                title: "Screenshot Saved",
                message: `Screenshot is located at ${filePath}`,
                icon: filePath
            });

        });

    });

    setPath.addEventListener("click", () => {
        dialog.showOpenDialog({
            title: "Open path to save screenshot",
            properties: [ 'openDirectory' ]
        }, savepath => {
            if ( ! savepath )
                return ;
            setPath.textContent = savepath;
        });
    });


    window.addEventListener("DOMContentLoaded", () => {
        const parentWindowId = getCurrentWindow().getParentWindow().webContents.id;
        setPath.textContent = app.getPath("pictures");
        inputFileName.value = `ScreenShot by Akara ${(new Date()).toLocaleString()}.png`.replace(/\s+/g, "_");
        ipc.sendTo(parentWindowId, "akara::screenshot:get_file");
    });


    ipc.on("akara::screenshot:send_file", (evt,screenshotContent) => {

        let base64String = "";

        for ( let _typedArray of screenshotContent ) {
            base64String += String.fromCodePoint(_typedArray);
        }

        const imgDiv = document.querySelector(".saveshot-img");
        const img = new Image();

        img.src = `data:image/png;base64,${window.btoa(base64String)}`;
        img.draggable = false;
        imgDiv.appendChild(img);

    });

})();
