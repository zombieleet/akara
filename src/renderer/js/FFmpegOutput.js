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
            getCurrentWindow
        }
    } = require("electron");

    
    const output               = document.querySelector(".ffmpeg-output");
    const ffmpegClose          = document.querySelector(".ffmpeg-close");
    const ffmpegClear          = document.querySelector(".ffmpeg-clear");
    const ffmpegCancel         = document.querySelector(".ffmpeg-cancel");
    const ffmpegConvertedBytes = document.querySelector(".ffmpeg-convertedbytes");
    
    ipc.on("akara::ffmpeg:convert", (evt,data,convertedBytes) => {

        if ( data )
            output.textContent += `${data.toString()}
                               `;
        
        ffmpegConvertedBytes.textContent = convertedBytes;
    });

    ffmpegClose.addEventListener("click", () => getCurrentWindow().close());
    
    ffmpegClear.addEventListener("click", () => {
        output.textContent = "";
    });

    ffmpegCancel.addEventListener("click", () => {
        ipc.sendTo(1,"akara::ffmpeg:convert:kill");
    });
    
})();
