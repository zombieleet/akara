
"use strict";

const {
    video,
    controls
} = require("../js/video_control.js");

const {
    ipcRenderer: ipc,
    remote: {
        dialog,
        Menu,
        MenuItem,
        getCurrentWindow,
        require: _require,
        shell: {
            showItemInFolder
        }
    }
} = require("electron");

const {
    requireSettingsPath
} = _require("./constants.js");

const {
    CURRENT_TIME
} = _require("./constants.js");

const {
    createNewWindow
} = _require("./newwindow.js");

const url = require("url");

const path = require("path");

const crypto = require("crypto");

const {
    disableVideoMenuItem,
    langDetect,
    getMime,
    validateMime,
    setupPlaying,
    readSubtitleFile,
    playlistLoad,
    sendNotification,
    removeClass,
    removeType,
    setCurrentPlaying,
    processMediaTags
} = require("../js/util.js");

const fs = require("fs");

const {
    videoContextMenu
} = _require("./menu.js");

const {
    _enterfullscreen,
    _leavefullscreen
} = require("../js/handle_dropdown_commands.js")();

const akara_emit = require("../js/emitter.js");

const mime = require("mime");

let controlMouseEnterFscreen = false;


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


module.exports.setTime = setTime;

const hashedPath = filePath => path.join(
    CURRENT_TIME,
    crypto
        .createHash("md5")
        .update(filePath)
        .digest("hex")
);
/**
 *
 *
 *  save video current time position
 *
 *
 **/

const saveCurrentTimePos = currPlaying => {
    const pathToFile = hashedPath(currPlaying);
    return fs.writeFileSync(pathToFile, controls.getCurrentTime());
};



/**
 *
 *
 * retrieved video current time
 *   starts video from were it stoped
 *
 **/

const getRecentPos = plItem  => {
    const pathToFile = hashedPath(plItem);
    if ( fs.existsSync(pathToFile) )
        return fs.readFileSync(pathToFile);
    return 0;
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


module.exports.updateTimeIndicator = () => {

    let timeIndicator = document.querySelector(".akara-time-current");

    const currTimeUpdate = document.querySelector(".akara-update-cur-time");
    const pNode = timeIndicator.parentNode;
    const elapsed = Math.round((controls.getCurrentTime()).toFixed(1));
    const timeIndicatorWidth = ( elapsed * pNode.clientWidth ) /
          ( controls.duration().toFixed(1)) ;

    timeIndicator.setAttribute("style", `width: ${( timeIndicatorWidth / pNode.clientWidth)*100}%`);
    currTimeUpdate.textContent = setTime();
    saveCurrentTimePos(video.src);
    return true;
};



/**
 *
 * every mouse event in the time indicator length
 * will pass through this function to get the proper
 * value of the current mouse location
 *
 **/

const handleMovement = (event,cb) => {
    const incrDiv = document.querySelector(".akara-time-current");
    const akControl = document.querySelector(".akara-control");

    let targetsOffsets ;


    /**
     * fullscreen mode will not allow proper handling of mouse events on
     * the control section
     **/
    if ( akControl.offsetLeft > 0 )
        targetsOffsets = akControl.offsetLeft;
    else
        targetsOffsets = event.target.offsetLeft + event.target.offsetTop;

    const result = Math.round(controls.duration() * ( event.clientX - targetsOffsets ) / incrDiv.parentNode.clientWidth);

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

module.exports.removeHoverTime = removeHoverTime;



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


module.exports.moveToDragedPos = moveToDragedPos;


/**
 *
 *
 * call any method of the control object
 * from data-fire
 *
 *
 **/

module.exports.fireControlButtonEvent = event => {

    ///////////////////////////////////////////////////////////
    // if ( ! video.src.length ) return dialog.showErrorBox( //
    //     "No Media", "No Media Source was found"           //
    // );                                                    //
    ///////////////////////////////////////////////////////////

    const target = event.target,
          nodeName = target.nodeName.toLowerCase();

    if ( nodeName !== "li" ) return ;

    if ( target.hasAttribute("data-fire") )
        controls[target.getAttribute("data-fire")](event);

    return ;
};



/**
 *
 * this function will be trigerred when video is in pause state
 *
 **/

module.exports.videoPauseEvent = () => {
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
            body: decodeURIComponent(path.basename(url.parse(video.src).path))
        });
    }
    return sendNotification("Now Playing", {
        body: decodeURIComponent(path.basename(url.parse(video.src).path))
    });

};




/**
 *
 *
 * handle play event when the video
 *  is just played
 *
 **/

module.exports.videoPlayEvent = () => {

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

module.exports.videoLoadedEvent = () => {
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
    const currTimeUpdate = document.querySelector(".akara-update-cur-time");
    currTimeUpdate.innerHTML = "00:00 / 00:00";
    document.querySelector(".cover-on-error-src").removeAttribute("style");
    //return video.removeAttribute("src");
};



/**
 *
 * during conversion start to
 * play next video or previous video
 *
 * the controls object is use
 * since we do not want to fire
 * __splitError in handle_droped_commands.js
 * because video.getAttribute("src") is assumed
 *    to be false whenever this function is hit
 * by calling the _next function
 *
 **/

const playNextOrPrev = () => {
    const akaraLoaded = document.querySelector(".akara-loaded");
    const playlistItem = akaraLoaded.querySelector(`#${video.getAttribute("data-id")}`);
    // ask user if to play next or
    // previous video or not at all

    if ( ! playlistItem )
        return disableControls();

    if ( playlistItem.nextElementSibling ) {
        return controls.next();
    } else if (playlistItem.previousElementSibling ) {
        return controls.previous();
    } else {
        return disableControls();
    }
};


module.exports.playNextOrPrev = playNextOrPrev;

/**
 *
 *
 *
 * videoErrorEvent is fired, when there is an error
 *  in playing the video
 *
 *
 **/

module.exports.videoErrorEvent = async (evt) => {

    console.log(evt.target.error.code, evt.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED);
    const akaraLoaded = document.querySelector(".akara-loaded");
    const playlistItem = akaraLoaded.querySelector(`#${video.getAttribute("data-id")}`);

    let _src = video.getAttribute("src");

    disableControls();


    switch(evt.target.error.code) {

    case evt.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:

        if ( url.parse(_src).protocol === "file:") {

            _src = _src.replace("file://","");
            // configuration prompt before converting,
            // convert automatically.
            // do not convert
            const btn = dialog.showMessageBox({
                type: "error",
                title: "Invalid stream",
                buttons: [ "No", "Yes" ],
                message: `${path.basename(_src)} is not valid. Would you like to convert it ?`
            });


            if ( btn === 0 )
                return '';

            const filePath = await validateMime(_src);

            if ( typeof(filePath) === "string" ) {
                return dialog.showErrorBox(
                    "Cannot convert media file", filePath
                );
            }
            // play converted or not
            playlistItem.setAttribute("data-full-path", filePath.convpath);
            return setupPlaying(playlistItem);
        } else {
            return dialog.showErrorBox(
                "Unsupported media file",
                "Requested Media File cannot be played"
            );
        }
    }

};



/**
 *
 *
 * jump current time indicator to selected time
 *  when the time indicator is clicked
 *
 **/

module.exports.clickedMoveToEvent = event => {
    const target = event.target;
    if ( target.classList.contains("akara-time-length")
         || target.classList.contains("akara-time-current")
         || target.classList.contains("akara-time-buffered") ) {
        return handleMovement(event, result => {
            console.log(result);
            video.currentTime = result;
        });
    }
    return false;
};


module.exports.videoEndedEvent = () => {

    const justEnded = document.querySelector("[data-now-playing=true]");
    const akaraLoaded = document.querySelector(".akara-loaded");

    if ( video.hasAttribute("data-random") ) {

        const playlistItems = document.querySelectorAll("[data-full-path]");

        const index = (Math.random() * playlistItems.length).toFixed();

        if ( index > playlistItems.length )

            return setupPlaying(playlistItems[0]);

        return setupPlaying(playlistItems[index]);
    }


    if ( justEnded.nextElementSibling && ! justEnded.hasAttribute("data-repeat") )

        return setupPlaying(justEnded.nextElementSibling);


    if ( justEnded.hasAttribute("data-repeat") )

        return controls.play();


    if ( ! justEnded.nextElementSibling && justEnded.parentNode.hasAttribute("data-repeat") )

        return setupPlaying(justEnded.parentNode.firstElementChild);

    // force the control element to change it's icon
    // if this is is not called, the control icon that handles
    // pause and play will not change

    return controls.pause();
};


/**
 *
 *
 * show time when video length indicator is hovered on
 *
 **/

module.exports.mouseMoveShowCurrentTimeEvent = event => {

    let target = event.target;

    if ( target.classList.contains("akara-time-length")
         || target.classList.contains("akara-time-current")
         || target.classList.contains("akara-time-buffered")
       ) {

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

module.exports.mouseDownDragEvent = event => {

    const jumpToSeekElement = document.querySelector(".akara-time");

    return event.target.classList.contains("akara-time-current")
        ? jumpToSeekElement.addEventListener("mousemove", moveToDragedPos)
        : false;
};




/**
 *
 *
 * if the volume icon is in mute state
 * unmute the video
 *
 **/

const __removeRedMute = () => {
    const changeVolumeIcon = document.querySelector("[data-fire=volume]");
    if ( video.muted ) {
        changeVolumeIcon.setAttribute("style", "color: red;");
        controls.unmute();
    } else {
        changeVolumeIcon.removeAttribute("style");
    }
};


/**
 *
 *
 * onmousewheel update the volume
 *
 *
 **/

module.exports.handleVolumeWheelChange = event => {

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
    return akara_emit.emit("video::volume", video.volume);

};





/**
 *
 * change volume when the volume indiciators
 *   are clicked on
 *
 **/
module.exports.handleVolumeChange = event => {

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


    akara_emit.emit("video::volume", video.volume);
    return true;
};



/**
 *
 *
 * setup track element with necessary attributes
 *
 **/
const setUpTrackElement = async (filePath,fileLang) => {
    const __tracks = video.querySelectorAll("track");
    const track = document.createElement("track");
    const subtitle = filePath;

    fileLang = fileLang || await langDetect(filePath);

    let lang = fileLang ? fileLang : `No Lang ${path.basename(filePath).substr(0, 7)}`;

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

const handleLoadSubtitle = async (filePath,cb) => {

    if ( ! filePath )
        return ;

    /**
     *
     * from computer the return value is an array
     * from internet it's just a string
     *
     **/

    [ filePath ] = Array.isArray(filePath) ? filePath : [ filePath ];


    if ( /x-subrip$/.test(mime.lookup(filePath)) )
        filePath = await cb(filePath);

    const { track, lang } = await setUpTrackElement(filePath);

    sendNotification("Subtitle", {
        body: "Subtitle have been successfully added"
    });

    video.appendChild(track);

    const { submenu } = videoContextMenu[16].submenu[1];

    submenu.push({
        label: lang,
        id: track.id,
        checked: false,
        click(menuItem) {
            // send the current pushed object to video::show_subtitle event
            //  the label value of menuItem will be used
            //  to determine the textTracks language
            akara_emit.emit("video::show_subtitle",menuItem,submenu.length - 1);
        },
        accelerator: `CommandOrCtrl+${track.id}`,
        type: "radio"
    });

    Object.assign(videoContextMenu[16].submenu[1], {
        submenu
    });


    const toggleSubOnOff = document.querySelector("[data-sub-on=true]");

    // start showing the track automatically
    // add this as a config option
    if ( ! track.previousElementSibling && toggleSubOnOff )
        video.textTracks[0].mode = "showing";

    akara_emit.emit("video::subtitle:shortcut", track);
};


const loadAlbumArt = async () => {

    const posterJson = await requireSettingsPath("poster.json");
    const posterSettings = require(posterJson);


    if ( ! posterSettings.album_art )
        return false;

    processMediaTags({

        url: decodeURIComponent(url.parse(video.src).path),

        onSuccess({ tags }) {

            if ( ! tags.picture ) {
                akara_emit.emit("akara::audio:albumart", undefined);
                return ;
            }

            const typedArrayBuf = new Uint8Array(tags.picture.data);

            let base64String ="";

            for ( let _typedArray of typedArrayBuf ) {
                base64String += String.fromCharCode(_typedArray);
            }

            akara_emit.emit(
                "akara::audio:albumart",
                `data:${tags.picture.format};base64,${window.btoa(base64String)}`
            );

        },
        onError(error) {
            akara_emit.emit("akara::audio:albumart", undefined);
        }
    });

};


/**
 *
 * loaddata event handler
 *
 *
 **/


module.exports.videoLoadData = async (event) => {

    const posterJson = await requireSettingsPath("poster.json");
    const posterSettings = require(posterJson);

    const currTimeUpdate = document.querySelector(".akara-update-cur-time");
    const pathToFile = hashedPath(video.src);


    /*if ( fs.existsSync(pathToFile) ) {

      dialog.showMessageBox({
      title: "Resume Media File",
      type: "info",
      message: "Resume from previous playing",
      buttons: [ "Yes", "No", "Cancel" ]
      }), btn => {

      if ( btn === 0 ) {
      video.currentTime = Number(getRecentPos(video.src).toString());
      return ;
      }

      if ( btn === 1 ) {
      fs.unlinkSync(pathToFile);
      return ;
      }

      if ( btn === 2 )
      return ;

      });
      }*/

    video.currentTime = Number(getRecentPos(video.src).toString());

    //currTimeUpdate.textContent = setTime();

    const submenu = videoContextMenu[16].submenu;

    // no need to remove if no subtitle was added in previous video
    if ( submenu ) {
        Object.assign(videoContextMenu[16].submenu[1],{
            submenu: []
        });
        Array.from(document.querySelectorAll("track"), el => {
            akara_emit.emit("video::subtitle:remove", el.id);
            el.remove();
        });
    }


    loadAlbumArt();

    akara_emit.once("akara::audio:albumart",  base64StringAlbum_art => {
        if ( ! base64StringAlbum_art ) {
            video.poster = posterSettings.poster;
            return ;
        }
        video.poster = base64StringAlbum_art;
    });

};





/**
 *
 *
 * handles the behaviour of control section
 * in fullscreen mood
 *
 *
 **/

const ctrlBhviourInFullScreen = akaraControl => {

    let id = setTimeout( () => {

        const unexpand = akaraControl.querySelector(".unexpand");

        // no-operation in strecth mood in fullscreen
        if ( unexpand )
            return ;

        /**
         *
         * prevent any operation on controls
         *  sections if not in fullscreen mode
         *
         **/

        if ( ! document.webkitIsFullScreen )
            return ;
        if ( controlMouseEnterFscreen )
            return ;

        akaraControl.hidden = true;

    }, 5000);

    return id;
};

module.exports.mouseMoveOnVideo = () => {

    const akaraControl = document.querySelector(".akara-control");

    if ( ! document.webkitIsFullScreen )
        return false;

    akaraControl.hidden = false;
    let id = ctrlBhviourInFullScreen(akaraControl);
    return true;
};




/**
 *
 *
 * set controlMouseEnterFscreen to boolean
 *   which is used by the hideCtrlsinfullscreen
 *   function to work properly with
 *   the controlDragFullScreen function
 *
 **/

module.exports.controlMouseEnter = evt => {
    controlMouseEnterFscreen = true;
};

module.exports.controlMouseLeave = evt => {
    controlMouseEnterFscreen = false;
};

module.exports.controlDragFullScreen = evt => {

    if ( ! document.webkitIsFullScreen )
        return false;

    const akControl = document.querySelector(".akara-control");
    const unexpand = akControl.querySelector(".unexpand");

    // no-operation in strecth mood in fullscreen
    if ( unexpand )
        return false;

    const mouseMoveEventDrag = evt => {
        let { screenX, screenY } = evt;
        const { left } = akControl.getBoundingClientRect();
        akControl.style.position = "absolute";
        akControl.style.left = `${screenX - left - 150}px`;
        akControl.style.top = `${screenY - 25}px`;
        return true;
    };

    document.documentElement.addEventListener("mousemove", mouseMoveEventDrag);

    akControl.addEventListener("mouseup", () => {
        document.documentElement.removeEventListener("mousemove", mouseMoveEventDrag);
    });

    return true;
};

module.exports.contextMenuEvent = () => {

    let menu = new Menu();

    let vidMenuInst ;


    akara_emit.emit("akara::playlist", videoContextMenu);

    videoContextMenu.forEach( _menu => {

        vidMenuInst = new MenuItem(_menu);

        disableVideoMenuItem(vidMenuInst);

        menu.append(vidMenuInst);

    });

    menu.popup(getCurrentWindow(), { async: true });
};

module.exports.lowHighVolume = volume => {

    const changeVolumeIcon = document.querySelector("[data-fire=volume]");

    let type;

    if ( volume && ( type = volume <= 0.3 ? "down" : "up") ) {

        changeVolumeIcon.classList.remove(`fa-volume-${ type === "down" ? "up" : type }`);
        changeVolumeIcon.classList.add(`fa-volume-${type}`);
    }

    if ( ! volume  || video.muted )
        changeVolumeIcon.setAttribute("style", "color: red");
    else
        changeVolumeIcon.removeAttribute("style");

};

const dbClickEvent = () => {

    if ( document.webkitIsFullScreen )
        return _leavefullscreen();
    else
        return _enterfullscreen();
};

module.exports.dbClickEvent = dbClickEvent;


module.exports.showSubtitle = (mItem,id) => {

    const textTracks = video.textTracks;

    const { length: _textTrackLength } = textTracks;

    const { submenu } = videoContextMenu[16].submenu[1];

    for ( let i = 0; i < _textTrackLength; i++ ) {

        if ( mItem.id === textTracks[i].id ) {
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
};

module.exports.showFileLocation = () => (
    showItemInFolder(
        video.getAttribute("src").replace("file://","")
    )
);


/**
 *
 * handle loading of subtitle from computer
 *
 *
 **/

const subHandlerComputer = () => {

    const val = dialog.showOpenDialog({

        title: "Select Subtitle",
        property: [ "openFile", "multiSelections" ],
        filters: [
            {
                name: "Subtitle File",
                extensions: [
                    "srt",
                    "webvvt"
                ]
            }
        ]
    });

    return val;
};



/**
 *
 * handle loading of subtitle from internet
 *
 **/
const subHandlerNet = () => {

    const __obj = {
        title: "subtitle",
        parent: getCurrentWindow()
    };

    const html = `${__obj.title}.html`;

    createNewWindow(__obj,html);
};




/**
 *
 * subtitle handler
 *
 **/
module.exports.subHandler = ( event, from, fPath ) => {

    let val;

    if ( from === "computer" )
        val = subHandlerComputer();

    if ( from === "net" && ! fPath )

        return subHandlerNet();

    if ( from === "net" && fPath )

        val = fPath;

    handleLoadSubtitle(val, async (filePath) => {
        const result = await readSubtitleFile(filePath);
        return result;
    });

    return true;
};



/**
 *
 *
 * loads playlist name
 *
 **/
module.exports.loadContextPlaylist = (videoContextMenu,playlistLocation) => {

    let { submenu } = videoContextMenu[28];

    if ( submenu.length > 0 )

        submenu = [];

    let result ;

    try {
        result = fs.readFileSync(playlistLocation);
    } catch(ex) {
        result = ex;
    }

    if ( Error[Symbol.hasInstance](result) )
        return false;

    Object.keys(JSON.parse(result)).forEach( list => {
        submenu.push({
            label: list,
            click: () => {
                const filteredPlaylistName = playlistLoad(list);
                ipc.sendTo(1,"akara::loadplaylist", filteredPlaylistName , list);
            }
        });
    });

    return submenu;
};



/**
 *
 *
 * loads all playlist items
 *
 **/
module.exports.contextPlaylist = videoContextMenu => {

    const akLoaded = document.querySelectorAll(".playlist");

    if ( akLoaded.length === 0 )

        return false;

    let { submenu } = videoContextMenu[27];

    if ( submenu.length > 0 )

        submenu = [];


    Array.from(akLoaded, pList => {
        submenu.push({
            label: pList.textContent,
            id: pList.getAttribute("id"),
            click: () => setupPlaying(pList)
        });
    });

    return submenu;
};



/**
 *
 * sets filter for video
 *
 **/
module.exports.videoSetFilter = (evt, { filterType, progressBarWidth, measurement }) => {

    let filter = video.style.filter;
    let regex = new RegExp(`${filterType}\\((\\d+|\\d+\\.\\d+)(%|px|deg|)\\)`);

    if ( filter === "unset" ) {
        video.style.filter =  `${filterType}(${progressBarWidth}${measurement})`;
        return ;
    }


    if ( regex.test(filter) ) {
        console.log("enter regex");
        filter = filter.replace(regex, `${filterType}(${progressBarWidth}${measurement})`);
        video.style.filter = filter;
        return ;
    }

    video.style.filter = filter + `${filterType}(${progressBarWidth}${measurement})`;
    return ;
};



/**
 *
 * reset filter to default value
 *
 **/
module.exports.videoResetFilter = (evt,type) => {
    console.log("hiasdfasdf");
    let regex = new RegExp(`${type}\\((\\d+|\\d+\\.\\d+)(%|px|deg|)\\)`);
    let filter = video.style.filter;
    if ( regex.test(filter) ) {
        console.log(regex);
        video.style.filter = filter.replace(regex,"");
    }
    return ;
};


module.exports.mediaProgress = evt => {

    // if ( video.buffered.length === 0 )
    //     return ;

    const networkState = document.querySelector(".akara-media-network-state");

    console.log(video.readyState);

    switch(video.readyState) {
    case video.HAVE_ENOUGH_DATA:
    case video.HAVE_FUTURE_DATA:
    case video.HAVE_CURRENT_DATA:
    case video.HAVE_METADATA:
        networkState.style.visibility = "hidden";
        break;
    case video.HAVE_NOTHING:
        networkState.style.visibility = "visible";
        break;
    }


    const bufferedLength = document.querySelector(".akara-time-buffered");
    const pNode = bufferedLength.parentNode;


    for ( let i = 0 ; i < video.buffered.length ; i++ ) {

        const elapsed = Math.round(video.buffered.end(i)).toFixed(1);
        const timeIndicationWidth = ( elapsed * pNode.clientWidth ) /
              ( controls.duration().toFixed(1));

        bufferedLength.style.width = (timeIndicationWidth / pNode.clientWidth) * 100 + "%";
    }
};

module.exports.mediaWaiting = evt => {
    console.log(video.readyState, video.networkState);

    if ( video.networkState === 2 )
        console.log("network state downloading");
    else
        console.log(evt.networkState);
};

if ( require.main !== module ) {

    akara_emit.on("video::state:track", (id,mode) => {

        const {
            submenu
        } = videoContextMenu[16].submenu[1];

        if ( mode === "disable" ) {

            Object.assign(submenu[id], {
                checked: false
            });

            Object.assign(videoContextMenu[16].submenu[1], {
                submenu
            });

            return ;
        }

        Object.assign(submenu[id], {
            checked: true
        });
    });

    akara_emit.on("akara::processStatus", (info,fin) => {
        let outputProcess = document.querySelector(".akara-output-process");
        outputProcess.hidden = false;
        outputProcess.textContent = info;
        console.log("output");
        if ( fin ) {
            outputProcess.animate({
                opacity: [ .70, .60, .50, .40, .30, .20, .10, .1 ]
            });
            outputProcess.hidden = true;
            return ;
        }
    });

}
