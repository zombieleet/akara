const { join, basename } = require("path");
const { app } = require("electron");

const APP_PATH = app.getAppPath();
const BACKGROUND_COLOR = "#4B4B4B";
const CONVERTED_MEDIA = join(app.getPath("userData"), "converted_media");


module.exports = {
    CONVERTED_MEDIA,
    APP_PATH,
    BACKGROUND_COLOR
};
