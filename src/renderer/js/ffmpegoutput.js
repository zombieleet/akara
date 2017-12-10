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
    
    ipc.on("akara::ffmpeg:convert", (evt,data) => {
        
        output.textContent += `${data.toString()}
                               `;
        
        output.scrollIntoViewIfNeeded();
    });

    ffmpegClose.addEventListener("click", () => getCurrentWindow().close());
    
    ffmpegClear.addEventListener("click", () => {
        output.textContent = "";
    });

    ffmpegCancel.addEventListener("click", () => {
        ipc.sendTo(1,"akara::ffmpeg:convert:kill");
    });
    
})();
