( () => {

    "use strict";

    const mime = require("mime");

    const {
        video,
        controls
    } = require("../js/video_control.js");

    const {
        disableVideoMenuItem,
        __MenuInst,
        langDetect,
        getMime,
        validateMime,
        setupPlaying,
        readSubtitleFile,
        sendNotification
    } = require("../js/util.js");

    const akara_emit = require("../js/emitter.js");

    const {
        parse
    } = require("url");

    const {
        basename,
        join
    } = require("path");

    const {
        readFileSync,
        writeFileSync
    } = require("fs");

    const {
        remote:
        {
            dialog,
            require: _require,
            Menu,
            MenuItem,
            getCurrentWindow,
            BrowserWindow,
            shell: {
                showItemInFolder
            }
        }, ipcRenderer: ipc
    } = require("electron");

    const {
        addMediaFile,
        addMediaFolder,
        _play,
        _stop,
        _pause,
        _next,
        _previous,
        _setPlaybackRate,
        _enterfullscreen,
        _leavefullscreen
    } = require("../js/handle_dropdown_commands.js")();

    const {
        videoContextMenu
    } = _require("./menu.js");

    const {
        CONVERTED_MEDIA
    } = _require("./constants.js");

    const currTimeUpdate = document.querySelector(".akara-update-cur-time"),
        jumpToSeekElement = document.querySelector(".akara-time"),
        akaraVolume = document.querySelector(".akara-volume"),
        changeVolumeIcon = document.querySelector("[data-fire=volume]"),
        akaraControl = document.querySelector(".akara-control"),
        controlElements = akaraControl.querySelector(".akara-control-element");

    const menu = new Menu();
    // the first window, this had to be hadcoded
    const win = BrowserWindow.fromId(1);
    const textTracks = video.textTracks;



    /**
     *
     *
     * calls getHumanTime function
     *  the current time and duration section is updated frequently
     *  as video plays
     *
     *
     **/


    const setTime = () => {

        const curTm = getHumanTime(controls.getCurrentTime());
        const durTm = getHumanTime(controls.duration());

        return `${curTm} / ${durTm}`;
    };




    /**
     *
     *
     * updateTimeIndicator is fired when timeupdate
     *  event listener is trigerred
     *
     * it calls setTime function to render the time
     *
     *
     **/


    const updateTimeIndicator = () => {

        let timeIndicator = document.querySelector(".akara-time-current");
        const currTimeUpdate = document.querySelector(".akara-update-cur-time");

        const elapsed = Math.round((controls.getCurrentTime()).toFixed(1));
        const timeIndicatorWidth = ( elapsed * timeIndicator.parentNode.clientWidth) /
                  ( controls.duration().toFixed(1));

        timeIndicator.setAttribute("style", `width: ${timeIndicatorWidth}px`);
        timeIndicator = undefined;
        currTimeUpdate.textContent = setTime();
        return true;

    };



    /**
     *
     *
     * jumpToClick, move the video indicator to
     * the position where mouse event is released
     *
     **/

    const jumpToClick = (event,arg) => Math.
        round(controls.duration() * ((event.clientX - event.target.offsetLeft) / arg));


    /**
     *
     *
     *
     *  handles the movement of the mouse arround the
     *    video length indicator
     *
     **/

    const handleMovement = (event,cb) => {
        const incrDiv = document.querySelector(".akara-time-current");
        const result = jumpToClick(event,incrDiv.parentNode.clientWidth);
        return cb(result);
    };




    /**
     *
     *
     * removes the time that is shown
     * whenever the video length indicator is hovered on
     *
     **/


    const removeHoverTime = () => {
        let isOverExists = document.querySelector("[data-hover=true]");

        if ( isOverExists ) {
            isOverExists.remove();
            isOverExists = undefined;
        }
        return ;
    };




    /**
     *
     *
     * converts the seconds returned by the video.duration and
     *   video.currentTime to human readable format
     *
     **/

    const getHumanTime = result => isNaN(result)
        ? "00:00"
        : `${(result/60).toFixed(2)}`.replace(/\./, ":");




    /**
     *
     *
     * show time whenever a section of the
     * video length indicator is hovered on
     *
     **/

    const createHoverTime = ({event,result}) => {

        removeHoverTime();

        let target = event.target;

        const hoverIndication = document.createElement("div"),
            hoverStillVideo = document.createElement("video"),
            hoverTimeIndication = document.createElement("span"),
            hoveredLocationTime = getHumanTime(result);


        hoverIndication.append(hoverTimeIndication);

        target = target.classList.contains("akara-time-length") ? target : target.parentNode;

        hoverIndication.setAttribute("data-hover", "true");

        hoverTimeIndication.textContent = hoveredLocationTime;

        let left = event.clientX - event.target.getBoundingClientRect().left,
            top = event.clientY - event.target.getBoundingClientRect().top;

        hoverIndication.setAttribute("style", `left: ${left - 15}px; top: ${top - 25}px`);

        return target.parentNode.insertBefore(hoverIndication,target);

    };



    /**
     *
     *
     * mouse was held down and dragged
     *  set video length indicator to the location
     *  where mouse is no longer held down
     *
     *
     **/

    const moveToDragedPos = event => handleMovement(event, result => {
        video.currentTime = result;
        createHoverTime({event,result});
    });




    /**
     *
     *
     * show error message, when no media is in playlist
     * and a video control element is clicked
     *
     **/

    const fireControlButtonEvent = event => {

        if ( ! video.src.length ) return dialog.showErrorBox(
            "No Media", "No Media Source was found"
        );

        const target = event.target,
            nodeName = target.nodeName.toLowerCase();

        if ( nodeName !== "li" ) return false;

        return controls[target.getAttribute("data-fire")]();
    };



    /**
     *
     * this function will be trigerred when video is in pause state
     *
     **/

    const videoPauseEvent = () => {
        const play = document.querySelector("[data-fire=play]");
        const pause = document.querySelector("[data-fire=pause]");
        play.classList.remove("akara-display");
        return pause.classList.add("akara-display");
    };


    /**
     *
     *
     * sends notification is video is playing
     *  or resuming from a paused state
     *
     **/
    const __checkPlayStateAndNotify = () => {

        if ( video.__status === "paused" ) {
            video.__status = undefined;
            return sendNotification("Resuming", {
                body: decodeURIComponent(basename(parse(video.src).path))
            });
        }
        return sendNotification("Now Playing", {
            body: decodeURIComponent(basename(parse(video.src).path))
        });

    };




    /**
     *
     *
     * handle play event when the video
     *  is just played
     *
     **/

    const videoPlayEvent = () => {

        const play = document.querySelector("[data-fire=play]");
        const pause = document.querySelector("[data-fire=pause]");
        const notify = __checkPlayStateAndNotify();

        pause.classList.remove("akara-display");

        localStorage.setItem("currplaying", video.src);

        return play.classList.add("akara-display");
    };



    /**
     *
     * videoLoadedEvent is trigerred whenever
     *  a playlist video is loaded in the video section
     *
     **/

    const videoLoadedEvent = () => {
        const currentVolumeSet = document.querySelectorAll("[data-volume-set=true]");
        const coverOnError = document.querySelector(".cover-on-error-src");

        video.volume = currentVolumeSet[currentVolumeSet.length - 1].getAttribute("data-volume-controler");

        if ( coverOnError )
            coverOnError.setAttribute("style", "display: none;");
    };




    /**
     *
     * disableControls when there is no media file
     *
     **/

    const disableControls = () => {
        currTimeUpdate.innerHTML = "00:00 / 00:00";
        document.querySelector(".cover-on-error-src").removeAttribute("style");
        return video.removeAttribute("src");
    };





    /**
     *
     *
     *
     * videoErrorEvent is fired, when there is an error
     *  in playing the video
     *
     *
     **/

    const videoErrorEvent = async () => {

        const _src = video.getAttribute("src").replace("file://","");
        const akaraLoaded = document.querySelector(".akara-loaded");
        const playlistItem = akaraLoaded.querySelector(`#${video.getAttribute("data-id")}`);


        // disable the controls on error
        disableControls();


        // possibly the codec or mime is not supported
        // show a message to the user to convert the file or not
        const btn = dialog.showMessageBox({
            type: "error",
            title: "Invalid stream",
            buttons: [ "Cancel", "Convert" ],
            message: `${basename(_src)} is not valid. Would you like to convert it ?`
        });

        // CONFIGURATION:- jump to play other medias
        //   if conversion is taking place



        /**
         *
         * during conversion start to
         * play next video or previous video
         *
         **/

        if ( playlistItem.nextElementSibling )
            _next();
        else
            _previous();


        /**
         *
         * 0 is first button which is cancel
         *
         **/

        if ( btn === 0 ) return false;


        // start conversion
        const path = await validateMime(_src);


        if ( ! path ) {
            disableControls();
            return dialog.showErrorBox(
                "Cannot convert stream",`${_src} was not converted`
            );
        }

        playlistItem.setAttribute("data-full-path", path);

        // CONFIGURATION:- play converted video automatically
        //     or NOT
        setupPlaying(playlistItem);

        return true;
    };



    /**
     *
     *
     * jump current time indicator to selected time
     *  by the user in the time indicator
     *
     **/

    const clickedMoveToEvent = event => {
        const target = event.target;
        if ( target.classList.contains("akara-time-length")
             || target.classList.contains("akara-time-current") ) {
            return handleMovement(event, result => video.currentTime = result);
        }
        return false;
    };




    /**
     *
     *
     * show time when video length indicator is hovered on
     *
     **/

    const mouseMoveShowCurrentTimeEvent = event => {

        let target = event.target;

        if ( target.classList.contains("akara-time-length")
             || target.classList.contains("akara-time-current") ) {

            let isOverExists = document.querySelector("[data-hover=true]");
            if ( isOverExists ) {
                isOverExists.remove();
                isOverExists = undefined;
            }
            return handleMovement(event, result => createHoverTime({event,result}) );
        }
        return false;
    };



    /**
     *
     *
     * mouseDownDragevent is fired when the mouse is held down and dragged
     *
     *
     **/

    const mouseDownDragEvent = event => event.target.classList.contains("akara-time-current") ?
        jumpToSeekElement.addEventListener("mousemove", moveToDragedPos) : false;




    /**
     *
     *
     * if the volume icon is in mute state
     * unmute the video
     *
     **/

    const __removeRedMute = () => {
        const changeVolumeIcon = document.querySelector("[data-fire=volume]");
        if ( changeVolumeIcon.hasAttribute("style") ) {
            changeVolumeIcon.removeAttribute("style");
            controls.unmute();
        }
        return ;
    };



    /**
     *
     *
     * onmousewheel update the volume
     *
     *
     **/

    const handleVolumeWheelChange = event => {
        const scrollPos = event.wheelDeltaY,
            decimalVol = scrollPos / 100,
            volumeElements = Array.prototype.slice.call(document.querySelectorAll("[data-volume-set=true]"));

        let popedValue;

        __removeRedMute();

        if ( (Math.sign(decimalVol) === -1 )
             && ( popedValue = volumeElements.pop() )
             && ( volumeElements.length >= 1 ) )
        {

            popedValue.removeAttribute("data-volume-set");
            video.volume = volumeElements[volumeElements.length - 1].getAttribute("data-volume-controler");
        }


        if ( Math.sign(decimalVol) === 1 ) {

            const nextElementFromArray = volumeElements[volumeElements.length - 1].nextElementSibling;

            if ( nextElementFromArray ) {
                nextElementFromArray.setAttribute("data-volume-set", "true");
                video.volume = nextElementFromArray.getAttribute("data-volume-controler");
            }
        }
        // to enable the showing of fa-volume-down
        if ( video.volume <= 0.3 )  return akara_emit.emit("video::low_volume");

        return akara_emit.emit("video::high_volume");

    };





    /**
     *
     * change volume when the volume indiciators
     *   are clicked on
     *
     **/
    const handleVolumeChange = event => {

        const target = event.target;
        let isChanged = 0;
        if ( target.nodeName.toLowerCase() !== "span" ) return false;
        target.setAttribute("data-volume-set", "true");
        video.volume = target.getAttribute("data-volume-controler");

        __removeRedMute();

        let _NextTarget = target.nextElementSibling;
        let _PrevTarget = target.previousElementSibling;

        while ( _NextTarget ) {
            _NextTarget.removeAttribute("data-volume-set");
            _NextTarget = _NextTarget.nextElementSibling;
        }

        while ( _PrevTarget ) {
            _PrevTarget.setAttribute("data-volume-set", "true");
            _PrevTarget = _PrevTarget.previousElementSibling;
        }

        if ( video.volume <= 0.3 ) {
            akara_emit.emit("video::low_volume");
            return true;
        }

        akara_emit.emit("video::high_volume");
        return true;
    };



    /**
     *
     *
     * setup track element with necessary attributes
     *
     **/
    const setUpTrackElement = async (path,fileLang) => {
        const __tracks = video.querySelectorAll("track");
        const track = document.createElement("track");
        const subtitle = path;

        fileLang = fileLang || await langDetect(path);

        let lang = fileLang ? fileLang : `No Lang ${basename(path).substr(0, 7)}`;

        track.setAttribute("src", subtitle);
        track.setAttribute("label", lang);
        track.setAttribute("srclang", lang);
        track.setAttribute("kind", "subtitles");

        // set the id of tracks from 0 1 2 3 ... n
        track.setAttribute("id", __tracks.length === 0 ? __tracks.length : (__tracks.length - 1) + 1);

        return { track, lang };
    };



    /**
     *
     *
     *
     * add subtitle to the list of subtitles
     *  in the menu
     *
     **/
    const handleLoadSubtitle = async (path,cb) => {

        if ( ! path ) return ;


        
        /**
         *
         * from computer the return value is an array
         * from internet it's just a string
         *
         **/
        
        [ path ] = Array.isArray(path) ? path : [ path ];

        
        if ( /x-subrip$/.test(mime.lookup(path)) )
            path = await cb(path);

        const { track, lang } = await setUpTrackElement(path);

        sendNotification("Subtitle", {
            body: "Subtitle have been successfully added"
        });

        video.appendChild(track);

        const { submenu } = videoContextMenu[16].submenu[1];

        submenu.push({
            label: lang,
            click(menuItem) {
                // send the current pushed object to video::show_subtitle event
                //  the label value of menuItem will be used
                //  to determine the textTracks language
                akara_emit.emit("video::show_subtitle",menuItem,submenu.length - 1);
            },
            accelerator: `CommandOrCtrl+${track.getAttribute("id")}`,
            type: "radio",
            checked: false
        });

        Object.assign(videoContextMenu[16].submenu[1], {
            submenu
        });
    };
    


    
    const MouseHoverOnVideo = () => {
        if ( ! document.webkitIsFullScreen ) return false;
        return akaraControl.removeAttribute("hidden");
    };



    // FIX-ME
    const MouseNotHoverVideo = () => {
        if ( ! document.webkitIsFullScreen ) return false;

        setTimeout( () => {
            akaraControl.setAttribute("hidden", "true");
        },3000);
        akaraControl.animate({
            opacity: [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0]
        },3000);
    };


    controlElements.addEventListener("click", fireControlButtonEvent);



    video.addEventListener("loadeddata", event => {

        currTimeUpdate.textContent = setTime();

        const submenu = videoContextMenu[16].submenu;
        
        // no need to remove if no subtitle was added in previous video
        if ( submenu ) {
            Object.assign(videoContextMenu[16].submenu[1],{
                submenu: []
            });
            Array.from(document.querySelectorAll("track"), el => {
                el.remove();
            });
        }

    });

    
    video.addEventListener("dblclick", () => {
        if ( ! video.hasAttribute("src") ) return false;

        if ( document.webkitIsFullScreen )
            return _leavefullscreen();
        else
            return _enterfullscreen();
    });


    
    video.addEventListener("mouseover", MouseHoverOnVideo);
    

    video.addEventListener("mouseout", MouseNotHoverVideo);


    video.addEventListener("timeupdate", updateTimeIndicator);
    

    video.addEventListener("ended", () => akara_emit.emit("video::ended"));
    

    video.addEventListener("pause", videoPauseEvent );
    

    video.addEventListener("play", videoPlayEvent );
    

    video.addEventListener("loadstart", videoLoadedEvent);
    

    video.addEventListener("loadedmetadata", () => {
        currTimeUpdate.textContent = setTime();
    });
    

    video.addEventListener("error", videoErrorEvent);

    
    video.addEventListener("contextmenu", event => {
        let vidMenuInst ;
        menu.clear();
        videoContextMenu.forEach( _menu => {
            vidMenuInst = new MenuItem(_menu);
            disableVideoMenuItem(vidMenuInst);
            menu.append(vidMenuInst);
        });
        menu.popup(getCurrentWindow(), { async: true });
    });


    
    jumpToSeekElement.addEventListener("click", clickedMoveToEvent);
    

    jumpToSeekElement.addEventListener("mousemove", mouseMoveShowCurrentTimeEvent);

    
    jumpToSeekElement.addEventListener("mouseout", removeHoverTime);
    

    jumpToSeekElement.addEventListener("mousedown", mouseDownDragEvent);
    

    jumpToSeekElement.addEventListener("mouseup", () =>
        jumpToSeekElement.removeEventListener(
            "mousemove",
            moveToDragedPos));
    

    akaraVolume.addEventListener("click", handleVolumeChange);
    

    akaraVolume.addEventListener("mousewheel", handleVolumeWheelChange);
    

    akara_emit.on("video::low_volume", type => {
        
        if ( type ) changeVolumeIcon.setAttribute("style", "color: red");
        
        changeVolumeIcon.classList.remove("fa-volume-up");
        
        changeVolumeIcon.classList.add("fa-volume-down");
        
    });

    
    akara_emit.on("video::high_volume", type => {
        
        if ( type ) changeVolumeIcon.removeAttribute("style");
        
        changeVolumeIcon.classList.remove("fa-volume-down");
        
        changeVolumeIcon.classList.add("fa-volume-up");
        
    });

    
    ipc.on("video-open-file", addMediaFile);
    

    ipc.on("video-open-folder", addMediaFolder);
    

    ipc.on("video-play", _play);
    

    ipc.on("video-pause", _pause);
    

    ipc.on("video-stop", _stop);
    

    ipc.on("video-next", _next);
    

    ipc.on("video-previous", _previous);
    

    ipc.on("video-repeat", () => video.setAttribute("loop", "true") );
    

    ipc.on("video-no-repeat", () => video.removeAttribute("loop") );
    

    ipc.on("video-open-external", () => showItemInFolder(
        video.getAttribute("src").replace("file://","")
    ));

    
    ipc.on("normal-speed", () => _setPlaybackRate(1));


    //DONT-HARD-CODE-ME
    ipc.on("fast-speed", () => _setPlaybackRate(12));
    

    ipc.on("very-fast-speed", () => _setPlaybackRate(25));
    

    ipc.on("slow-speed", () => _setPlaybackRate(0.7));
    

    ipc.on("very-slow-speed", () => _setPlaybackRate(0.2));
    

    ipc.on("subtitle::load-sub", (event,val) => {
        
        handleLoadSubtitle(val, async (path) => {

            // TODO: HANDLE PROMISE ERROR LATER
            const result = await readSubtitleFile(path);
            return result;
        });
        
    });

    
    akara_emit.on("video::show_subtitle", (mItem,id) => {
        
        const { length: _textTrackLength } = textTracks;
        
        const { submenu } = videoContextMenu[16].submenu[1];

        for ( let i = 0; i < _textTrackLength; i++ ) {
            
            if ( mItem.label === textTracks[i].label ) {
                
                textTracks[i].mode = "showing";
                
                continue;
                
            }
            
            textTracks[i].mode = "hidden";
            
            // disable text track from radio checked state to false
            //   for some reason electron does not do this
            Object.assign(submenu[textTracks[i].id], {
                checked: false
            });
            
            Object.assign(videoContextMenu[16].submenu[1], {
                submenu
            });
        }
        
        Object.assign(submenu[id], {
            checked: true
        });
        
    });

    ipc.on("enter-video-fullscreen", _enterfullscreen);

    ipc.on("leave-video-fullscreen", _leavefullscreen);


})();
