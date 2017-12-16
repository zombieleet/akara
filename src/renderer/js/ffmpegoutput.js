; ( () => {
    const {
        ipcRenderer: ipc,
        remote: {
            getCurrentWindow
        }
    } = require("electron");

    
    const output = document.querySelector(".ffmpeg-output");
    const ffmpegClose = document.querySelector(".ffmpeg-close");
    const ffmpegClear = document.querySelector(".ffmpeg-clear");
    const ffmpegCancel = document.querySelector(".ffmpeg-cancel");
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
