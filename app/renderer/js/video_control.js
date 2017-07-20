"use strict";

const { EventEmitter } = require("events");

const videoEmit = new EventEmitter();

const video = document.querySelector("video");
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

module.exports = {
    videoEmit,
    controls,
    video
};
