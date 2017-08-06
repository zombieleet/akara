const { join, basename } = require("path");
const { app } = require("electron");

const APP_PATH = app.getAppPath();
const BACKGROUND_COLOR = "#4B4B4B";
const USER_DATA = app.getPath("userData");
const CONVERTED_MEDIA = join(USER_DATA, "converted_media");
const DOWNLOADED_SUBTITLE = join(USER_DATA, "subtitle");
const URL_ONLINE = "icanhazip.com/";

const SIZE = 1000;

const MEASUREMENT = [ "Bytes", "kB", "MB", "GB", "TB" ];
/*const BYTE = 8;
const MBYTE = 1048576;
const GBYTE = 1073741824;
const TBYTE = 1099511627776;
*/

module.exports = {
    CONVERTED_MEDIA,
    APP_PATH,
    BACKGROUND_COLOR,
    URL_ONLINE,
    DOWNLOADED_SUBTITLE,
    SIZE,
    MEASUREMENT
};
