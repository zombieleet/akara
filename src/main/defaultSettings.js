
"use strict";

const path = require("path");
const { app } = require("electron");

const {
    media,
    subtitle,
    settings,
    share,
    window
} = require("./shortcut.js");

module.exports.poster =  {poster: path.join(app.getAppPath(), "app", "renderer", "img", "posters", "default_poster.jpg") };
module.exports.playbackrate = { fast: 12, veryfast: 25, slow: 0.7, veryslow: 0.2};
module.exports.filter = {};
module.exports.share  = { deactivate_sharing_option: "no", request_permission_before_sending_videos: "no" , "cache_expiry_date": (new Date()).valueOf()};
module.exports.volume = { volume_default_level: 50, volume_max_level: 70, volume_warn_exceed_max: true };

module.exports.subtitle = {
    "auto_add_subtitle": "no",
    "auto_add_downloaded_subtitle": "yes"
};

module.exports.cueStyle = {

    "font-size": "",
    "font-weight": "",
    "font-family": "",

    color: "",
    opacity: "",

    "margin-top": "",
    "margin-bottom": "",
    "margin-right": "",
    "margin-left": "",

    visibility: "",

    "text-decoration-line": "",
    "text-decoration-color": "",
    "text-decoration-style": "",
    "text-shadow": "",

    "background-attachment": "",
    "background-clip": "",
    "background-color": "",
    "background-image": "",
    "background-repeat": "",
    "background-size": "",

    "outline-color": "",
    "outline-style": "",
    "outline-width": "",

    "line-height": "",
    "white-space": ""
};

module.exports.shortcut = { media , subtitle, settings, share, window };

module.exports.custom_uibuttons = {
    ["control-buttons"]: {
        play: [],
        pause: [],
        stop: [],
        next: [],
        previous: [],
        volume: [],
        filter: [],
        repeat: [],
        random: [],
        subtitle: [],
        expand: [],
        unexpand: [],
        enterfullscreen: [],
        leavefullscreen: []
    },

    ["media-buttons"]:{
        play: [],
        pause: [],
        check: [],
        uncheck: []
    },

    ["podcast-buttons"]: {
        play: [],
        home: [],
        grid: [],
        list: [],
        uncheck: [],
        check: [],
        folder: [],
        times: [],
        close: [],
        download: [],
        add: []
    },

    ["window-buttons"]: {
        close: [],
        minimize: [],
        maximize: [],
        restore: []
    },

    [ "playlist-buttons" ]: {
        delete: [],
        load: [],
        add: [],
        uncheck: [],
        check: [],
        times: [],
        play: []
    }

};

// default fonts

module.exports.uibuttons = {
    ["control-buttons"]: {
        play: "fa-play",
        pause: "fa-pause",
        stop: "fa-stop",
        next: "fa-forward",
        previous: "fa-backward",
        volume: "fa-volume-up",
        filter: "fa-filter",
        repeat: "fa-repeat",
        random: "fa-random",
        subtitle: "fa-cc",
        expand: "fa-arrows-h",
        unexpand: "fa-exchange",
        leavefullscreen: "fa-compress",
        enterfullscreen: "fa-expand"
    },
    ["media-buttons"]:{
        play: "fa-play",
        pause: "fa-pause",
        check: "fa-check-square-o",
        uncheck: "fa-square-o"

    },
    ["podcast-buttons"]: {
        play: "fa-play",
        home: "fa-home",
        grid: "fa-th-large",
        list: "fa-list",
        uncheck: "fa-square-o",
        check: "fa-check-square",
        times: "fa-times-circle",
        folder: "fa-folder",
        close: "fa-window-close",
        add: "fa-plus-square",
        download: "fa-download"
    },
    ["window-buttons"]: {
        close: "fa-window-close",
        minimize: "fa-window-minimize",
        maximize: "fa-window-maximize",
        restore: "fa-window-restore"
    },
    ["playlist-buttons"]: {
        delete: "fa-trash",
        load: "fa-file-powerpoint-o",
        add: "fa-plus-square",
        times: "fa-times-circle",
        check: "fa-check-square",
        uncheck: "fa-square-o",
        play: "fa-play-circle"
    }
};
