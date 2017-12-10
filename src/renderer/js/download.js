( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            BrowserWindow,
            getCurrentWindow,
            require: _require
        }
    } = require("electron");

    const {
        downloadURL,
        computeByte
    } = require("../js/util.js");


    const close  = document.querySelector(".download-close");
    const filename = document.querySelector(".akara-download-filename");
    const downByte = document.querySelector(".akara-download-meter");
    const unknownByte = document.querySelector(".akara-unknown-download-meter");

    const downByPercent = document.querySelector(".akara-downloading-percent");
    const downloadState = document.querySelector(".akara-download-state");

    const currentByte = document.querySelector(".akara-currentByte");
    const totalByte = document.querySelector(".akara-totalByte");

    const cancel = document.querySelector(".akara-download-cancel");
    const pause = document.querySelector(".akara-download-pause");
    const resume = document.querySelector(".akara-download-resume");
    const restart = document.querySelector(".akara-download-restart");


    /**
     *
     *
     * hide or show pause resume and restart 
     *  buttons
     *
     *
     **/
    
    const hide = ({_pause,_resume,_restart}) => {
        pause.hidden = _pause;
        resume.hidden = _resume;
        restart.hidden = _restart;
    };
    


    /**
     *
     *
     *  download::state event listener will be trigerred
     *  whenever the state of the download is updated
     *
     **/
    
    ipc.on("download::state", (event,state) => {

        downloadState.textContent = state === "progressing"
            ? "Downloading"
            : state;

        switch(state) {
        case "paused":
            hide({_pause:true,_resume:false,_restart:true});
            break;
        case "cancelled":
            // close download window
            ipc.send("close-download-window");
            break;
        case "resumed":
            hide({_pause:false,_resume:true,_restart:true});
            break;
        case "noResume":
            hide({_pause:true,_resume:true,_restart:false});
            break;
        case "progressing":
            pause.disabled = false;
            break;
        case "completed":
            pause.disabled = true;
            cancel.disabled = true;
            break;
        default:
            // do nothing
        }
    });

    
    /**
     *
     *
     * download::gottenByte event listener will be trigerred 
     * each time a byte is downloaded
     *
     **/

    
    ipc.on("download::gottenByte", (event,bytes) => {
        currentByte.textContent = computeByte(bytes);
    });

    
    /**
     *
     *
     *
     * download::filename event is trigerred whenever
     *  the downloads starts, fname is the name of the file
     *
     **/

    ipc.on("download::filename", (event,fname) => {
        filename.textContent = fname;
    });

    
    /**
     *
     *
     *
     * download::totalbyte event is trigerred whenever the download starts
     *  bytes contains the totalbyte of the file
     *
     **/
    
    ipc.on("download::totalbyte", (event,bytes) => {
        
        /**
         * when byte is 0 don't do a percent download
         * just do an unknown byte download
         **/
        
        if ( bytes === 0 ) {
            totalByte.setAttribute("style", "display: hidden;");
            return ;
        }
        
        totalByte.textContent = computeByte(bytes);
    });


    ipc.on("akara::downloadPath", (evt,url,cb) => {
        downloadURL(url,getCurrentWindow(),cb);
    });
    
    /**
     *
     * download::computePercent calculates 
     * the percentage of receivedByte to totalByte
     *
     **/
    
    ipc.on("download::computePercent", (event,rByte,tByte) => {

        if ( tByte === 0 ) {
            unknownByte.setAttribute("data-unknown-byte", "true");
            return ;
        }


        if ( unknownByte.hasAttribute("data-unknown-byte") ) {
            unknownByte.removeAttribute("data-unknown-byte");
        }
        
        const percent = ( ( rByte / tByte ) * 100 ) + "%";
        downByPercent.textContent = percent;
        downByte.setAttribute("style", `width: ${percent}; padding: 3px; display: block`);
        
    });

    
    resume.addEventListener("click", () => {
        ipc.send("download::resume");
    });

    
    cancel.addEventListener("click", () => {
        ipc.send("download::cancel");
        getCurrentWindow().close();
    });
    
    restart.addEventListener("click", () => {
        ipc.send("download::restart");
    });

    close.addEventListener("click", () => {
        // the cancel button will only be disabled
        //   if download is completed
        if ( ! cancel.disabled )
            ipc.send("download::cancel");

        getCurrentWindow().close();

    });

    pause.addEventListener("click", () => {
        ipc.send("download::pause");
    });

})();
