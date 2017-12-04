"use strict";
const {
    ipcRenderer: ipc,
    remote: {
        Menu,
        MenuItem,
        getCurrentWindow,
        require: _require
    }
} = require("electron");

const {
    createNewWindow: filterWindow
} = _require("./newwindow.js");

const akara_emit = require("../js/emitter.js");
const video = document.querySelector("video");
const akLoaded = document.querySelector(".akara-loaded");
let _REPEAT_MENU_ = new Menu();

let target, _SUBTITLE_MENU_ = new Menu();


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

                //target.setAttribute("data-title","repeat one");
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
                //target.setAttribute("data-title","repeat all");
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
                //target.setAttribute("data-title","normal");
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
        const akControl = document.querySelector(".akara-control");
        const expand = akControl.querySelector(".expand");

        changeIcon.classList.add("fa-arrows-alt");
        changeIcon.classList.remove("fa-expand");
        changeIcon.setAttribute("data-fire","leavefullscreen");

        video.style.height = "100%";
        video.style.width = "100%";
        
        akControl.setAttribute("data-fullscreenwidth", "true");
        akControl.hidden = true;

        expand.setAttribute("style","visibility: visible;");

        return video.webkitRequestFullScreen();
    },
    leavefullscreen() {

        const changeIcon = document.querySelector(".fa-arrows-alt");
        const akControl = document.querySelector(".akara-control");

        const expand_unexpand = akControl.querySelector(".expand")
                  || akControl.querySelector(".unexpand");

        changeIcon.classList.add("fa-expand");
        changeIcon.classList.remove("fa-arrows-alt");
        changeIcon.setAttribute("data-fire","enterfullscreen");

        video.style.width = null;
        video.style.height = null;

        akControl.removeAttribute("data-fullscreenwidth");
        akControl.removeAttribute("style");

        akControl.hidden = false;

        if ( expand_unexpand ) {
            expand_unexpand.removeAttribute("style");
            expand_unexpand.classList.remove("unexpand");
            expand_unexpand.classList.add("expand");
        }

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
    },
    expand({ target }) {

        const akControl = document.querySelector(".akara-control");

        let { position, left, top } = akControl.style;

        Object.assign(this, {
            position,
            left,
            top
        });

        akControl.removeAttribute("data-fullscreenwidth");
        akControl.removeAttribute("style");

        target.classList.remove("expand");
        target.classList.add("unexpand");

        target.setAttribute("data-fire", "unexpand");
    },
    unexpand({ target }) {

        const akControl = document.querySelector(".akara-control");

        akControl.setAttribute("data-fullscreenwidth", "true");

        const { position, left, top } = this;

        Object.assign(akControl.style, {
            position,
            left,
            top
        });

        target.classList.remove("unexpand");

        target.classList.add("expand");

        target.setAttribute("data-fire", "expand");

    },
    random({ target }) {

        const random = target;

        video.setAttribute("data-random", "random");
        random.setAttribute("data-fire", "norandom");
    },
    norandom({ target }) {

        const no_random = target;

        video.removeAttribute("data-random");
        no_random.setAttribute("data-fire", "random");
    },
    filter() {
        const __obj = {
            title: "filter",
            width: 408,
            height: 730
        };

        let html = `${__obj.title}.html`;
        let window = filterWindow(__obj,html);
    }
};

buildRepeatMenu();

module.exports = {
    video,
    controls
};
