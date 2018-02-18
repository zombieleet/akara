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
        downloadFile,
        computeByte,
        resumeDownloading
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
        // case "interrupted":
        //     pause.hidden = true;
        //     cancel.hidden = true;
        //     resume.hidden = true;
        //     restart.hidden = false;
        //     break;
        case "progressing":
            pause.disabled = false;
            cancel.disabled = false;
            resume.hidden = true;
            restart.hidden = true;
            break;
        case "completed":
            pause.disabled = true;
            cancel.disabled = true;
            resume.hidden = false;
            restart.hidden = false;
            break;
        case "cancelled":
            restart.hidden = false;
            resume.hidden = true;
            pause.hidden = false;
            cancel.hidden = true;
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


    // /**
    //  *
    //  *
    //  *
    //  * download::filename event is trigerred whenever
    //  *  the downloads starts, fname is the name of the file
    //  *
    //  **/

    // ipc.on("download::filename", (event,fname) => {
    //     filename.textContent = fname;
    // });


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


    // ipc.on("akara::downloadPath", (evt,url,cb) => {
    //     downloadURL(url,getCurrentWindow(),cb);
    // });

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

        const percent = Math.trunc(( ( rByte / tByte ) * 100 ));
        const percentWidth = percent + "%";
        downByPercent.textContent = percentWidth;
        downByte.setAttribute("style", `width: ${percentWidth};display: block`);

    });


    // resume.addEventListener("click", () => {
    //     ipc.send("download::resume");
    // });


    // cancel.addEventListener("click", () => {
    //     ipc.send("download::cancel");
    //     getCurrentWindow().close();
    // });


    async function downloadDomEvents(item) {

        pause.addEventListener("click", () => {
            item.pause();
        });

        close.addEventListener("click", () => {
            // the cancel button will only be disabled
            //   if download is completed
            if ( ! cancel.disabled ) {
                item.cancel();
            }
            getCurrentWindow().close();
        });


        restart.addEventListener("click", () => {
            downloadFile(item.getURL(),getCurrentWindow());
        });

        resume.addEventListener("click", () => {
            resumeDownloading(item,getCurrentWindow().webContents);
        });

        filename.textContent = item.getFilname();
    };

    ipc.on("download::started", async (event,item) => {
        console.log(item);
        await downloadDomEvents(item);
    });

})();
