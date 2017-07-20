"use strict";

const { EventEmitter } = require("events");

const { remote: { dialog }, ipcRenderer: ipc } = require("electron");

const { parse } = require("url");
const { basename } = require("path");

const videoEmit = new EventEmitter();

const video = document.querySelector("video"),
    controlElements = document.querySelector(".akara-control-element"),
    jumpToSeekElement = document.querySelector(".akara-time"),
    akaraVolume = document.querySelector(".akara-volume");
//jumpToSeekElement = document.querySelector(".akara-control");



const controls = {

    play() { return  video.play(); },
    pause()  { return video.pause(); },

    stop() {

        video.currentTime = 0;
        this.pause();

        video.__status = undefined;

        return ;
    },
    mute() {

        const _mute = document.querySelector("[data-drop=_mute]");


        _mute.textContent = _mute.textContent.replace("Mute", " Unmute");

        video.muted = true;

        videoEmit.emit("low_volume", true);

        return _mute.setAttribute("data-drop", "_unmute");

    },
    unmute() {
        // unmute video
        const _unmute = document.querySelector("[data-drop=_unmute]");

        _unmute.textContent = _unmute.textContent.replace("Unmute", " Mute");

        video.muted = false;

        videoEmit.emit("high_volume", true);

        return _unmute.setAttribute("data-drop", "_mute");

    },
    next() {
        videoEmit.emit("go-to-next");
    },
    previous() {
        videoEmit.emit("go-to-previous");
    },
    volume() {

        if ( video.muted )
            return this.unmute();

        return this.mute();
    },
    getCurrentTime() { return video.currentTime; },
    duration() { return video.duration; }

};




const updateTimeIndicator = () => {

    let timeIndicator = document.querySelector(".akara-time-current");
    const currTimeUpdate = document.querySelector(".akara-update-cur-time");

    const elapsed = Math.round((controls.getCurrentTime()).toFixed(1));
    const timeIndicatorWidth = ( elapsed * timeIndicator.parentNode.clientWidth) /
              ( controls.duration().toFixed(1));

    timeIndicator.setAttribute("style", `width: ${timeIndicatorWidth}px`);

    timeIndicator = undefined;
    
    currTimeUpdate.textContent = `${getHumanTime(controls.getCurrentTime())} / ${getHumanTime(controls.duration())}`;

    return true;
};


const sendNotification = (title,message) => new Notification(title,message);

const jumpToClick = (event,arg) => Math.
    round(controls.duration() * ((event.clientX - event.target.offsetLeft) / arg));

const handleMovement = (event,cb) => {

    const incrDiv = document.querySelector(".akara-time-current");
    const result = jumpToClick(event,incrDiv.parentNode.clientWidth);

    return cb(result);
};

const removeHoverTime = () => {

    let isOverExists = document.querySelector("[data-hover=true]");

    if ( isOverExists ) {
        isOverExists.remove();
        isOverExists = undefined;
    }

    return ;

};

const getHumanTime = result => `${(result/60).toFixed(2)}`.replace(/\./, ":");

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


const moveToDragedPos = event => handleMovement(event, result => {
    video.currentTime = result;
    createHoverTime({event,result});
});

const fireControlButtonEvent = event => {

    if ( ! video.src.length )

        return dialog.showErrorBox("No Media", "No Media Source was found");


    const target = event.target,
        nodeName = target.nodeName.toLowerCase();

    if ( nodeName !== "li" ) return false;


    return controls[target.getAttribute("data-fire")]();
};

const videoPauseEvent = () => {

    const play = document.querySelector("[data-fire=play]");
    const pause = document.querySelector("[data-fire=pause]");

    play.classList.remove("akara-display");


    // if stop is triggered vide.__status will be reset to undefined
    /*video.__status = "paused";


    if ( video.__status ) {
        let notify = sendNotification("Paused", {
            body: decodeURIComponent(basename(parse(video.src).path))
        });
    }*/

    return pause.classList.add("akara-display");
};

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

const videoPlayEvent = () => {

    const play = document.querySelector("[data-fire=play]");
    const pause = document.querySelector("[data-fire=pause]");

    const notify = __checkPlayStateAndNotify();


    pause.classList.remove("akara-display");

    //setTimeout( notify.close().bind(notify), 5000);

    return play.classList.add("akara-display");
};

const videoLoadedEvent = () => {
    const currentVolumeSet = document.querySelectorAll("[data-volume-set=true]");
    video.volume = currentVolumeSet[currentVolumeSet.length - 1].getAttribute("data-volume-controler");
};

const clickedMoveToEvent = event => {

    const target = event.target;

    if ( target.classList.contains("akara-time-length") || target.classList.contains("akara-time-current") ) {
        return handleMovement(event, result => video.currentTime = result);
    }

    return false;
};

const mouseMoveShowCurrentTimeEvent = event => {

    let target = event.target;

    if ( target.classList.contains("akara-time-length") || target.classList.contains("akara-time-current") ) {

        let isOverExists = document.querySelector("[data-hover=true]");

        if ( isOverExists ) {
            isOverExists.remove();
            isOverExists = undefined;
        }

        return handleMovement(event, result => createHoverTime({event,result}) );

    }

    return false;
};

const mouseDownDragEvent = event => event.target.classList.contains("akara-time-current") ?
    jumpToSeekElement.addEventListener("mousemove", moveToDragedPos) : false;


const __removeRedMute = () => {

    const changeVolumeIcon = document.querySelector("[data-fire=volume]");

    if ( changeVolumeIcon.hasAttribute("style") ) {
        changeVolumeIcon.removeAttribute("style");
        controls.unmute();
    }
    return ;
};

const handleVolumeWheelChange = event => {
    const scrollPos = event.wheelDeltaY,
        decimalVol = scrollPos / 100,
        volumeElements = Array.prototype.slice.call(document.querySelectorAll("[data-volume-set=true]"));

    let popedValue;

    /*

     BAD IMPLEMENTATION OF SCROLLING TO CHANGE VOLUME;

     let value;

     if ( ( Math.sign(decimalVol) === -1 ) && ( value = Math.pow(decimalVol, 2) / 2 ) <= 0.09 ) {

        video.volume = Number(value.toExponential().replace(/-\d+$/,"-2")).toFixed(2);
        console.log(event.srcElement,event);

     }*/

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
    if ( video.volume <= 0.3 )  return videoEmit.emit("low_volume");

    return videoEmit.emit("high_volume");

};

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
        videoEmit.emit("low_volume");
        return true;
    }

    videoEmit.emit("high_volume");

    return true;
};

function initVideoEvents() {

    controlElements.addEventListener("click", fireControlButtonEvent);
    
    video.addEventListener("loadeddata", event => {
        const currTimeUpdate = document.querySelector(".akara-update-cur-time");
        currTimeUpdate.textContent = `${getHumanTime(controls.getCurrentTime())} / ${getHumanTime(controls.duration())}`;
    });
    
    video.addEventListener("timeupdate", updateTimeIndicator);

    video.addEventListener("ended", () => videoEmit.emit("ended"));

    video.addEventListener("pause", videoPauseEvent );

    video.addEventListener("play", videoPlayEvent );

    video.addEventListener("loadstart", videoLoadedEvent);

    video.addEventListener("error", event => {
        dialog.showErrorBox("Unexpected Error",`Unexpected Error while playing ${basename(video.src)}`);
    });

    jumpToSeekElement.addEventListener("click", clickedMoveToEvent);

    jumpToSeekElement.addEventListener("mousemove", mouseMoveShowCurrentTimeEvent);

    jumpToSeekElement.addEventListener("mouseout", removeHoverTime);

    jumpToSeekElement.addEventListener("mousedown", mouseDownDragEvent);

    jumpToSeekElement.addEventListener("mouseup", () =>
        jumpToSeekElement.removeEventListener("mousemove", moveToDragedPos));

    akaraVolume.addEventListener("click", handleVolumeChange);
    akaraVolume.addEventListener("mousewheel", handleVolumeWheelChange);

    let changeVolumeIcon = document.querySelector("[data-fire=volume]");

    videoEmit.on("low_volume", type => {

        if ( type ) changeVolumeIcon.setAttribute("style", "color: red");

        changeVolumeIcon.classList.remove("fa-volume-up");
        changeVolumeIcon.classList.add("fa-volume-down");
    });

    videoEmit.on("high_volume", type => {

        if ( type ) changeVolumeIcon.removeAttribute("style");

        changeVolumeIcon.classList.remove("fa-volume-down");
        changeVolumeIcon.classList.add("fa-volume-up");
    });

}

module.exports = {
    videoEmit,
    controls,
    video,
    initVideoEvents
};
