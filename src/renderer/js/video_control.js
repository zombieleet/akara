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

const ff = require("../js/util.js");

const akara_emit = require("../js/emitter.js");
const video = document.querySelector("video");
const akLoaded = document.querySelector(".akara-loaded");
let _REPEAT_MENU_ = new Menu();
let target, _SUBTITLE_MENU_ = new Menu();


const applyButtonConfig = (element,section,type) => {

    let font = getButtonConfig(section,type);

    if ( /data:image\//.test(font) ) {
        element.style.backgroundImage = `url(${font})`;
        element.setAttribute("data-image_icon", "image");
        return ;
    }

    Array.from(element.classList, _class_ => {
        if ( _class_ === "fa" || _class_ === font )
            element.classList.remove(_class_);
    });

    element.classList.add("fa");
    element.classList.add(font);

    return ;
};

const getButtonConfig = (section,type) => JSON.parse(localStorage.getItem(section))[type];

const buildRepeatMenu = () => {

    const menuItems = [
        {
            label: "Repeat One",
            id: 0,
            type: "radio",
            click() {

                // if the playlist is set to repeat all
                // remove data-repeat attribute from the parent element of the playlist
                if ( akLoaded.hasAttribute("data-repeat") )
                    akLoaded.removeAttribute("data-repeat");

                getCurrentWindow().webContents.send("video-repeat");

                //target.setAttribute("data-title","repeat one");
            }
        },
        {
            label: "Repeat All",
            id: 1,
            type: "radio",
            click() {

                if ( video.loop )
                    video.loop = false;

                getCurrentWindow().webContents.send("video-no-repeat");

                //target.setAttribute("data-title","repeat all");

                // set data-repeat attribute of the parent element of the playlist
                // to repeat the playlist from the beginning ones ended
                akLoaded.setAttribute("data-repeat","repeat");
            }
        },
        {
            label: "Normal",
            id: 2,
            type: "radio",
            checked: true,
            click() {
                // if repeat all is set
                if ( akLoaded.hasAttribute("data-repeat") )
                    return akLoaded.removeAttribute("data-repeat");

                return getCurrentWindow().webContents.send("video-no-repeat");
            }
        }
    ];


    const isSingleVideoRepeat = localStorage.getItem("LOOP_CURRENT_VIDEO");
    const currentPlaying = akLoaded.querySelector("[data-now-playing]");

    if ( isSingleVideoRepeat ) {
        if ( isSingleVideoRepeat === currentPlaying.getAttribute("id") ) {
            menuItems[0].checked = true;
            menuItems[2].checked = false;
        } else
            getCurrentWindow().webContents.send("video-no-repeat");
    }

    menuItems.forEach( mItem => {
        _REPEAT_MENU_.append(new MenuItem(mItem));
    });

    return _REPEAT_MENU_;
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

        const enterfscreen = document.querySelector("[data-fire=enterfullscreen]");
        const akControl = document.querySelector(".akara-control");
        const expand = akControl.querySelector(".expand");
        //const unexpand = akControl.querySelector(".unexpand");

        enterfscreen.setAttribute("data-fire","leavefullscreen");
        video.style.height = "100%";
        video.style.width = "100%";
        akControl.setAttribute("data-fullscreenwidth", "true");
        akControl.hidden = true;

        expand.setAttribute("style","visibility: visible;");

        enterfscreen.removeAttribute("class");

        applyButtonConfig(enterfscreen,"control-buttons","leavefullscreen");

        this.unexpand({ target: expand});


        return video.webkitRequestFullScreen();
    },
    leavefullscreen() {

        const leavefscreen = document.querySelector("[data-fire=leavefullscreen]");
        const akControl = document.querySelector(".akara-control");

        const expandUnexpandControl = akControl.querySelector(".expand")
              || akControl.querySelector(".unexpand");

        leavefscreen.setAttribute("data-fire","enterfullscreen");

        video.style.width = null;
        video.style.height = null;

        akControl.removeAttribute("data-fullscreenwidth");
        akControl.removeAttribute("style");

        akControl.hidden = false;

        leavefscreen.removeAttribute("class");

        if ( expandUnexpandControl ) {
            expandUnexpandControl.removeAttribute("style");
            expandUnexpandControl.classList.remove("unexpand");
            expandUnexpandControl.classList.add("expand");
        }

        applyButtonConfig(leavefscreen,"control-buttons","enterfullscreen");

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
        _REPEAT_MENU_.clear();
        buildRepeatMenu().popup(getCurrentWindow(), { async: true });
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


        target.removeAttribute("class");
        target.classList.add("unexpand");
        target.setAttribute("data-fire", "unexpand");

        applyButtonConfig(target,"control-buttons","unexpand");


    },
    unexpand({ target }) {

        const akControl = document.querySelector(".akara-control");
        const { position, left, top } = this;

        akControl.setAttribute("data-fullscreenwidth", "true");

        Object.assign(akControl.style, {
            position,
            left,
            top
        });

        target.removeAttribute("class");
        target.classList.add("expand");
        target.setAttribute("data-fire", "expand");

        applyButtonConfig(target,"control-buttons","expand");

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

module.exports = {
    video,
    controls,
    applyButtonConfig,
    getButtonConfig
};
