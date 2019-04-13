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

"use strict";

const {
    video,
    controls
} = require("../js/VideoControl.js");

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
    disableVideoMenuItem,
    setCurrentPlaying,
    readSubtitleFile,
    sendNotification,
    processMediaTags,
    validateMime,
    setupPlaying,
    playlistLoad,
    langDetect,
    getMime
} = require("../js/Util.js");


const { requireSettingsPath , CURRENT_TIME } = _require("./constants.js");
const { createNewWindow }     = _require("./newwindow.js");
const { videoContextMenu }    = _require("./menu.js");


const url        = require("url");
const path       = require("path");
const crypto     = require("crypto");
const fs         = require("fs");
const akara_emit = require("../js/Emitter.js");
const mime       = require("mime");

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
    crypto.createHash("md5").update(filePath).digest("hex")
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

    const firstFragment = localStorage.getItem("MEDIA_FRAGMENT_FIRST");

    if ( firstFragment ) {
        const lastFragment = localStorage.getItem("MEDIA_FRAGMENT_LAST");
        console.log(video.duration === video.currentTime );
        if (
            (lastFragment && video.currentTime > Number(lastFragment) )
                || ( video.currentTime >= video.duration )
        ) {
            console.log("Shit");
            video.currentTime = parseFloat(firstFragment);
        }
    }

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

    //const result = Math.round(controls.duration() * ( event.clientX - targetsOffsets ) / incrDiv.parentNode.clientWidth);
    const result = (controls.duration() * ( event.clientX - targetsOffsets ) / incrDiv.parentNode.clientWidth);
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

const getHumanTime = result => {
    const date = new Date(null);
    date.setSeconds(result);
    return date.toISOString().substr(11,8);
};




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
        return sendNotification({
            title: "Resuming",
            message: "Resuming Media" + decodeURIComponent(path.basename(url.parse(video.src).path)),
            icon: video.poster
        });
    }

    return sendNotification({
        title: "Playing",
        message: "Now Playing" + decodeURIComponent(path.basename(url.parse(video.src).path)),
        icon: video.poster
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

    console.log("hi");

    if ( coverOnError )
        coverOnError.setAttribute("style", "display: none;");
};




/**
 *
 * disableControls when there is no media file or something bad happens
 * when playing a media file
 *
 **/
("style", "display: none;");
const disableControls = () => {
    const currTimeUpdate = document.querySelector(".akara-update-cur-time");
    currTimeUpdate.innerHTML = "00:00 / 00:00";
    document.querySelector(".cover-on-error-src").removeAttribute("style");
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

    const akaraLoaded = document.querySelector(".akara-loaded");
    const playlistItem = akaraLoaded.querySelector(`#${video.getAttribute("data-id")}`);

    let _src = video.getAttribute("src");

    if ( ! evt.target.error )
        return;

    disableControls();

    if ( akaraLoaded.childElementCount === 0 )
        return;

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


    // play shuffled video
    if ( video.hasAttribute("data-random") ) {
        const playlistItems = document.querySelectorAll("[data-full-path]");
        const index = (Math.random() * playlistItems.length).toFixed();
        if ( index > playlistItems.length )
            return setupPlaying(playlistItems[0]);
        return setupPlaying(playlistItems[index]);
    }

    // play the next playlist item if the just ended playlist item is not set to repeat
    if ( justEnded.nextElementSibling )
        return setupPlaying(justEnded.nextElementSibling);

    // replay all media files in the playlist if set to repeat all
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
    console.log(filePath);
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
        return false;

    /**
     *
     * from computer the return value is an array
     * from internet it's just a string
     *
     **/

    [ filePath ] = Array.isArray(filePath) ? filePath : [ filePath ];


    if ( /x-subrip$/.test(mime.lookup(filePath)) ) {
        filePath = await cb(filePath);
        console.log(filePath);
    }

    const { track, lang } = await setUpTrackElement(filePath);

    sendNotification({
        title: "Subtitle",
        message: "Subtitle have been successfully added"
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


    // in the controls section if toggle is choosed to be turned off
    const toggleSubOnOff = document.querySelector("[data-sub-on=true]");

    // start showing the track automatically
    // add this as a config option
    if ( toggleSubOnOff ) {

        if ( ! track.previousElementSibling ) {
            console.log("i expect ones");
            video.textTracks[0].mode = "showing";
        } else {
            // track.previousElementSibling defined
            console.log(video.textTracks[video.textTracks.length - 1], "hit", "hit");
            video.textTracks[video.textTracks.length - 1].mode = "hidden";
        }
    }

    akara_emit.emit("video::subtitle:shortcut:add", track);

    return filePath;
};

module.exports.handleLoadSubtitle = handleLoadSubtitle;

const loadAlbumArt = () => {

    const posterJson = requireSettingsPath("poster.json");
    const posterSettings = require(posterJson);

    console.log(posterSettings.album_art, "here there");
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


module.exports.videoLoadData = event => {

    const posterJson = requireSettingsPath("poster.json");
    const posterSettings = require(posterJson);

    const currTimeUpdate = document.querySelector(".akara-update-cur-time");
    const currentTime = Number(getRecentPos(video.src).toString());

    if ( currentTime !== 0 ) {

        const btn = dialog.showMessageBox({
            type: "info",
            message: "Continue Playing media file from previous location",
            buttons: [ "Continue", "Cancel" ]
        });

        // play media file from previous time location
        if ( btn === 0 ) {
            video.currentTime = currentTime;
        }

    }

    const extRegexp = new RegExp(`\\${path.extname(video.src)}$`);
    const srtReplaced = video.src.replace(extRegexp, ".srt");
    const webvvtReplaced = video.src.replace(extRegexp, ".webvvt");

    const subtitlePath = fs.existsSync(srtReplaced)
          ? srtReplaced
          : ( () => fs.existsSync(webvvtReplaced) ? webvvtReplaced : false )();

    if ( subtitlePath ) {

        handleLoadSubtitle(subtitlePath, async (filePath) => {

            if ( webvvtReplaced.test(subtitlePath) )
                return webvvtReplaced;

            const result = await readSubtitleFile(filePath);
            return result;
        });

    }

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


    const playlistParent = document.querySelector(".akara-loaded");
    const currentItemPlaying = playlistParent.querySelector(`#${video.getAttribute("data-id")}`);

    if ( currentItemPlaying.getAttribute("data-belongsto-playlist") === "podder" ) {
        const { podcast } = _require("./configuration.js");
        const pod = require(podcast);
        video.poster = JSON.parse(currentItemPlaying.getAttribute("podcast-metadata")).image;
        return ;
    }

    loadAlbumArt();

    akara_emit.once("akara::audio:albumart",  base64StringAlbum_art => {
        console.log(base64StringAlbum_art);
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

module.exports.setFullScreen = () => {

    let { _enterfullscreen, _leavefullscreen } = (require("../js/HandleDropdownCommands.js"))();

    if ( document.webkitIsFullScreen )
        return _leavefullscreen();
    else
        return _enterfullscreen();
};


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
        document.querySelector(".cover-on-error-src").setAttribute("style", "display: none;");
        break;
    case video.HAVE_NOTHING:
        networkState.style.visibility = "visible";
        disableControls();
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

module.exports.videoFragment = evt => {

    const akaraTimeIndicator = document.querySelector(".akara-time");
    const firstFragment = akaraTimeIndicator.querySelector("[data-fragment=start]");
    const lastFragment = akaraTimeIndicator.querySelector("[data-fragment=end]");

    const location = (
        ((evt.clientX / akaraTimeIndicator.parentNode.clientWidth)*100)
    ).toFixed(5);

    const createFragment = (startEnd,type) => {

        const fragmentEl = document.createElement("div");
        const result = (controls.duration() * evt.clientX  / akaraTimeIndicator.parentNode.clientWidth);

        fragmentEl.setAttribute("data-fragment", startEnd);
        fragmentEl.setAttribute("data-fragment-location", evt.clientX);

        fragmentEl.classList.add("akara-media-fragment");
        fragmentEl.style.left = `${location}%`;
        akaraTimeIndicator.appendChild(fragmentEl);

        akara_emit.emit("akara::media:fragment:set", { type , time: result });
    };

    if ( ! firstFragment ) {
        createFragment("start", "FIRST");
        console.log(localStorage.getItem("MEDIA_FRAGMENT_FIRST"));
        return;
    }

    const firstFrag = parseInt(firstFragment.getAttribute("data-fragment-location"));
    const lastFrag = lastFragment ? parseInt(lastFragment.getAttribute("data-fragment-location")) : null;

    console.log(location, firstFrag, lastFrag);

    if ( evt.clientX <  firstFrag ) {
        firstFragment.remove();
        createFragment("start", "FIRST");
        return;
    }

    if ( lastFrag &&
         ( evt.clientX > lastFrag
           || evt.clientX < lastFrag
         )
       ) {
        lastFragment.remove();
        createFragment("end", "LAST");
        return;
    }

    if ( evt.clientX === firstFrag ) {

        const timeFrame = localStorage.getItem("MEDIA_FRAGMENT_FIRST");

        firstFragment.remove();
        akara_emit.emit("akara::media:fragment:unset", "FIRST");

        if ( lastFrag ) {
            akara_emit.emit("akara::media:fragment:set", { type: "FIRST" , time: timeFrame  });
            lastFragment.setAttribute("data-fragment", "start");
        }
        return;
    }

    if ( lastFrag && ( evt.clientX === lastFrag ) ) {
        lastFragment.remove();
        akara_emit.emit("akara::media:fragment:unset", "LAST");
        return;
    }

    createFragment("end", "LAST");
    return;
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
