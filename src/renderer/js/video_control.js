"use strict";

const akara_emit = require("../js/emitter.js");

const video = document.querySelector("video");

const controls = {

    play() {
        return  video.play();
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

        akara_emit.emit("video::low_volume", true);

        return _mute.setAttribute("data-drop", "_unmute");

    },
    unmute() {
        // unmute video
        const _unmute = document.querySelector("[data-drop=_unmute]");

        _unmute.textContent = _unmute.textContent.replace("Unmute", " Mute");

        video.muted = false;

        akara_emit.emit("video::high_volume", true);

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
    }
};

module.exports = {
    video,
    controls
};
