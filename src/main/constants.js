"use strict";
const {
    join,
    basename
} = require("path");

const {
    app
} = require("electron");

const {
    existsSync,
    mkdirSync,
    writeFileSync
} = require("fs");

const {
    video,
    audio,
    subtitle,
    others
} = require("./shortcut.js");

const APP_PATH = app.getAppPath();
const BACKGROUND_COLOR = "#4B4B4B";
const USER_DATA = app.getPath("userData");

const PLAYLIST_FILE = () => {

    const playlistfile = join(USER_DATA, "playlist.json");

    if ( existsSync(playlistfile) )
        return playlistfile;

    writeFileSync(playlistfile, JSON.stringify({}));

    return playlistfile;
};

const _CONVERTED_MEDIA = () => {
    const _conv = join(USER_DATA, "converted_media");

    if ( existsSync(_conv) )
        return _conv;

    mkdirSync(_conv);

    return _conv;
};

const PODCAST = () => {
    const pod = join(USER_DATA, "podcast.json");
    if ( existsSync(pod) )
        return pod;

    writeFileSync(pod, JSON.stringify({}));
    return pod;
};

const requireSettingsPath = type => {

    const settingsPath = SETTINGS();

    return new Promise((resolve,reject) => {

        const jsonPath = join(settingsPath, type);

        if ( existsSync(jsonPath) )
            resolve(jsonPath);

        if ( ! existsSync(jsonPath) ) {

            let objConfig = {};

            switch(type) {
            case "poster.json":
                objConfig = { poster: join(APP_PATH, "app", "renderer", "img", "posters", "default_poster.jpg") };
                break;
            case "playbackrate.json":
                objConfig = { fast: 12, veryfast: 25, slow: 0.7, veryslow: 0.2};
                break;
            case "filter.json":
                break;
            case "share.json":
                objConfig = { deactivate_sharing_option: "no", request_permission_before_sending_videos: "no" , "cache_expiry_date": (new Date()).valueOf()};
                break;
            case "volume.json":
                objConfig = { volume_default_level: 50, volume_max_level: 70, volume_warn_exceed_max: true };
                break;
            case "shortcut.json":
                objConfig = { video , audio , subtitle , others };
                break;
            case "custom_uibuttons.json":
                /*
                 * holds user custom fonts
                 *
                 */
                objConfig = {
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
                break;
            case "uibuttons.json":
                /*
                  *
                  * default fonts
                  *
                 */
                objConfig = {
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
                break;
            }

            writeFileSync(jsonPath, JSON.stringify(objConfig));
            resolve(jsonPath);
        }
    });
};

const SETTINGS = () => {

    const settings = join(USER_DATA, "settings");

    if ( existsSync(settings) )
        return settings;

    mkdirSync(settings);
    return settings;
};

const USER_POSTERS_LOCATION = () => {
    const posters = join(USER_DATA, "posters");

    if ( existsSync(posters) )
        return posters;

    mkdirSync(posters);
    return posters;
};

const _CURRENT_TIME = () => {

    const currenttime = join(USER_DATA, "currenttime");

    if ( existsSync(currenttime) )
        return currenttime;

    mkdirSync(currenttime);

    return currenttime;
};


( () => {
    if ( existsSync(USER_DATA) )
        return ;
    mkdirSync(USER_DATA);
})();
const CONVERTED_MEDIA = _CONVERTED_MEDIA();
const DOWNLOADED_SUBTITLE = join(USER_DATA, "subtitle");
const CURRENT_TIME = _CURRENT_TIME();
const URL_ONLINE = "icanhazip.com/";
const SIZE = 1000;
const MEASUREMENT = [ "Bytes", "kB", "MB", "GB", "TB" ];
const TWITTER_OAUTH = "https://api.twitter.com/oauth/authenticate";
const FFMPEG_LOCATION = `${APP_PATH}/node_modules/.bin/`;



/*const BYTE = 8;
const MBYTE = 1048576;
const GBYTE = 1073741824;
const TBYTE = 1099511627776;
*/

module.exports = {
    CONVERTED_MEDIA,
    CURRENT_TIME,
    APP_PATH,
    BACKGROUND_COLOR,
    URL_ONLINE,
    DOWNLOADED_SUBTITLE,
    SIZE,
    MEASUREMENT,
    PLAYLIST_FILE,
    TWITTER_OAUTH,
    PODCAST,
    FFMPEG_LOCATION,
    requireSettingsPath,
    USER_POSTERS_LOCATION
};
