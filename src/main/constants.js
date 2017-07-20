const { join, basename } = require("path");
const { app } = require("electron");

//const APP_PATH = app.getAppPath()

const CONVERTED_MEDIA = join(app.getPath("userData"), "converted_media");


module.exports = {
    CONVERTED_MEDIA
};
