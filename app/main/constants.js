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

const _CURRENT_TIME = () => {

    const currenttime = join(USER_DATA, "currenttime");

    if ( existsSync(currenttime) )
        return currenttime;

    mkdirSync(currenttime);

    return currenttime;
};
const CONVERTED_MEDIA = _CONVERTED_MEDIA();

const DOWNLOADED_SUBTITLE = join(USER_DATA, "subtitle");

const CURRENT_TIME = _CURRENT_TIME();

const URL_ONLINE = "icanhazip.com/";

const SIZE = 1000;

const MEASUREMENT = [ "Bytes", "kB", "MB", "GB", "TB" ];

const TWITTER_OAUTH = "https://api.twitter.com/oauth/authenticate";

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
    TWITTER_OAUTH
};
