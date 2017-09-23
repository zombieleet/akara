"use strict";
const {
    remote: {
        Menu,
        MenuItem,
        getCurrentWindow
    }
} = require("electron");

const akara_emit = require("../js/emitter.js");

const video = document.querySelector("video");

const akLoaded = document.querySelector(".akara-loaded");

let _REPEAT_MENU_ = new Menu();

let target;

let _SUBTITLE_MENU_ = new Menu();


const buildRepeatMenu = () => {

    const menuItems = [
        {
            label: "Repeat One",
            id: 0,
            type: "radio",
            click() {

                video.loop = true;

                if ( akLoaded.hasAttribute("data-repeat") )
                    akLoaded.removeAttribute("data-repeat");

                target.setAttribute("data-title","repeat one");
            }
        },
        {
            label: "Repeat All",
            id: 1,
            type: "radio",
            click() {
                akLoaded.setAttribute("data-repeat","repeat");
                if ( video.loop )
                    video.loop = false;
                target.setAttribute("data-title","repeat all");
            }
        },
        {
            label: "Normal",
            id: 2,
            type: "radio",
            checked: true,
            click() {
                video.loop = false;
                akLoaded.removeAttribute("data-repeat");
                target.setAttribute("data-title","normal");
            }
        }
    ];

    menuItems.forEach( mItem => {
        _REPEAT_MENU_.append(new MenuItem(mItem));
    });

    return true;
};


const controls = {

    play() {
        return video.play();
    },
    pause()  {
        return video.pause();
    },

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

        akara_emit.emit("video::volume", video.volume);

        return _mute.setAttribute("data-drop", "_unmute");

    },
    unmute() {
        // unmute video
        const _unmute = document.querySelector("[data-drop=_unmute]");

        _unmute.textContent = _unmute.textContent.replace("Unmute", " Mute");

        video.muted = false;

        akara_emit.emit("video::volume", video.volume);

        return _unmute.setAttribute("data-drop", "_mute");

    },
    next() {
        akara_emit.emit("video::go-to-next");
    },
    previous() {
        akara_emit.emit("video::go-to-previous");
    },
    volume() {

        if ( video.muted )
            return this.unmute();

        return this.mute();
    },
    enterfullscreen() {

        const changeIcon = document.querySelector(".fa-expand");

        changeIcon.classList.add("fa-arrows-alt");
        changeIcon.classList.remove("fa-expand");
        changeIcon.setAttribute("data-fire","leavefullscreen");

        video.parentNode.setAttribute("style", "height: 100%; width: 100%;");

        return document.querySelector(".akara-media").webkitRequestFullScreen();
    },
    leavefullscreen() {

        const changeIcon = document.querySelector(".fa-arrows-alt");

        changeIcon.classList.add("fa-expand");
        changeIcon.classList.remove("fa-arrows-alt");
        changeIcon.setAttribute("data-fire","enterfullscreen");
        video.parentNode.removeAttribute("style");
        document.querySelector(".akara-control").removeAttribute("hidden");
        return document.webkitCancelFullScreen();
    },
    getCurrentTime() {
        return video.currentTime;
    },
    duration() {
        return video.duration;
    },
    setPlaybackRate(rate) {
        video.playbackRate = rate;
        return rate;
    },
    repeat({target: _target}) {
        target = _target;
        _REPEAT_MENU_.popup(getCurrentWindow(), { async: true });
    },
    subtitle({ target }) {
        
        const textTracks = video.textTracks;
        
        const { length: _textTrackLength } = textTracks;
        
        if ( target.getAttribute("data-sub-on") === "true") {
            
            target.setAttribute("data-sub-on", "false");
            
            for ( let i = 0; i < _textTrackLength; i++ ) {
                
                if ( textTracks[i].mode === "showing" ) {
                    textTracks[i].mode = "hidden";
                    target.setAttribute("data-sub", textTracks[i].id);
                }
            }
            
        } else {
            
            target.setAttribute("data-sub-on", "true");
            
            for ( let i = 0; i < _textTrackLength; i++ ) {
                
                if ( Number(textTracks[i].id) === Number(target.getAttribute("data-sub")) ) {
                    textTracks[i].mode = "showing";
                    target.removeAttribute("data-sub");
                }
            }
        }
    }
};

buildRepeatMenu();

module.exports = {
    video,
    controls
};
