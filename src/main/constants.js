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

const jsonFileDB = require("./defaultSettings.js");


const BACKGROUND_COLOR = "#4B4B4B";
const USER_DATA        = app.getPath("userData");
const APP_PATH         = app.getAppPath();


const createNonExisting = ({ type , name }) => {
    const nonExisting = USER_DATA !== name ? join(USER_DATA, name) : USER_DATA;
    if ( existsSync(nonExisting) ) return nonExisting;
    switch(type) {
    case "file":
        writeFileSync(nonExisting, JSON.stringify({}));
        break;
    case "directory":
        mkdirSync(nonExisting);
        break;
    default:
        throw new Error(`Cannot create ${type} of ${name}`);
    }
    return nonExisting;
};

const requireSettingsPath = type => {

    const settingsPath = createNonExisting({ type: "directory", name: "settings" });
    const jsonPath     = join(settingsPath, type);

    // if a file exists for jsonPath
    // return the path to that file
    if ( existsSync(jsonPath) ) return jsonPath;

    // if a file to jsonPath does not exists
    // check for default settings for that configuration
    let objConfig = jsonFileDB[type.replace(".json","")];

    // if there are no default settings specified for the configuration
    // create a json file for it configuration
    if ( ! objConfig ) objConfig = {};

    // or save the default settings to the json configuration file
    writeFileSync(jsonPath, JSON.stringify(objConfig));

    return jsonPath;
};


( () => createNonExisting( { type: "directory", name: USER_DATA }))();

const DOWNLOADED_SUBTITLE  = createNonExisting({ type: "directory" , name: "subtitle"       });
const PLUGIN_DIRECTORY     = createNonExisting({ type: "file"      , name: "plugins.json"  });
const CONVERTED_MEDIA      = createNonExisting({ type: "directory" , name: "converted_media"});
const CURRENT_TIME         = createNonExisting({ type: "directory" , name: "currenttime"    });


const FFMPEG_LOCATION = `${APP_PATH}/node_modules/.bin/`;
const TWITTER_OAUTH   = "https://api.twitter.com/oauth/authenticate";
const MEASUREMENT     = [ "Bytes", "kB", "MB", "GB", "TB" ];
const URL_ONLINE      = "icanhazip.com/";
const SIZE            = 1000;


/*const BYTE = 8;
const MBYTE = 1048576;
const GBYTE = 1073741824;
const TBYTE = 1099511627776;
*/

module.exports = {

    DOWNLOADED_SUBTITLE,
    PLUGIN_DIRECTORY,
    BACKGROUND_COLOR,
    CONVERTED_MEDIA,
    FFMPEG_LOCATION,
    TWITTER_OAUTH,
    CURRENT_TIME,
    MEASUREMENT,
    URL_ONLINE,
    APP_PATH,
    SIZE,

    requireSettingsPath,
    createNonExisting
};
