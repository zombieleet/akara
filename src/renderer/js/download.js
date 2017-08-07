( () => {
    
    "use strict";
    
    const {
        ipcRenderer: ipc,
        remote: {
            BrowserWindow,
            require: _require
        }
    } = require("electron");

    const {
        downloadURL,
        computeByte
    } = _require("./utils.js");

    const url = localStorage.getItem("url");
    
    const close  = document.querySelector(".download-close");
    const filename = document.querySelector(".akara-download-filename");
    const downByte = document.querySelector(".akara-download-meter");
    
    const downByPercent = document.querySelector(".akara-downloading-percent");
    const downloadState = document.querySelector(".akara-download-state");

    const currentByte = document.querySelector(".akara-currentByte");
    const totalByte = document.querySelector(".akara-totalByte");

    const cancel = document.querySelector(".akara-download-cancel");
    const pause = document.querySelector(".akara-download-pause");
    const resume = document.querySelector(".akara-download-resume");
    const restart = document.querySelector(".akara-download-restart");

    const [ win ] = BrowserWindow.getAllWindows().filter(
        win => win.getTitle() === "Download" ? win : undefined
    );

    const hide = ({_pause,_resume,_restart}) => {
        pause.hidden = _pause;
        resume.hidden = _resume;
        restart.hidden = _restart;
    };
    
    localStorage.removeItem("url");
    
    downloadURL(url,win);

    
    ipc.on("download::state", (event,state) => {
        
        downloadState.textContent = state === "progressing" ? "Downloading" : state;
        
        if ( state === "paused" ) {
            hide({_pause:true,_resume:false,_restart:true});
        } else if ( state === "canceled" ) {
            ipc.send("close-download-window");
        } else if ( state === "resumed" ) {
            hide({_pause:false,_resume:true,_restart:true});
        } else if ( state === "noResume" ) {
            hide({_pause:true,_resume:true,_restart:false});
        } else if ( state === "progressing" ) {
            pause.disabled = false;
        } else if ( state === "completed" ) {
            pause.disabled = true;
            cancel.disabled = true;
        }
    });
    
    ipc.on("download::gottenByte", (event,bytes) => {
        currentByte.textContent = computeByte(bytes);
    });

    ipc.on("download::filename", (event,fname) => {
        filename.textContent = fname;
    });
    
    ipc.on("download::totalbyte", (event,bytes) => {
        console.log(bytes);
        totalByte.textContent = computeByte(bytes);
    });

    ipc.on("download::computePercent", (event,rByte,tByte) => {
        console.log(rByte,tByte);
        const percent = ( ( rByte / tByte ) * 100 ) + "%";
        downByPercent.textContent = percent;
        downByte.setAttribute("style", `width: ${percent}`);
    });


    
    resume.addEventListener("click", () => {
        console.log("resume");
        ipc.send("download::resume");
    });
    
    cancel.addEventListener("click", () => {
        ipc.send("download::cancel");
        ipc.send("close-download-window");
    });

    restart.addEventListener("click", () => {
        ipc.send("download::restart");
    });
    
    close.addEventListener("click", () => {
        // the cancel button will only be disabled
        //   if download is completed
        if ( ! cancel.disabled )
            ipc.send("download::cancel");
        
        ipc.send("close-download-window");
        
    });

    pause.addEventListener("click", () => {
        ipc.send("download::pause");
    });

})();
