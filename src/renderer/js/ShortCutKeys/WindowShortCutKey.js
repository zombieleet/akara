
"use strict";

const windowShortCutKey = new(require(("../../js/keyevents.js")));
const launchWindow = require("../../js/handle_dropdown_commands.js")();

const {
    remote: {
        getCurrentWindow
    }
} = require("electron");

const {
    getKeyIndex
} = require("../../js/util.js");

windowShortCutKey.register({
    name: "fullscreen window",
    key: getKeyIndex("window", "fullscreen window").key,
    modifier: getKeyIndex("window", "fullscreen window").modifier,
    handler() {
        const curWindow = getCurrentWindow();
        curWindow.setFullScreen(!curWindow.isFullScreen());
    }
});

windowShortCutKey.register({
    name: "kiosk window",
    key: getKeyIndex("window", "kiosk window").key,
    modifier:  getKeyIndex("window", "kiosk window").modifier,
    handler() {
        const curWindow = getCurrentWindow();
        curWindow.setKiosk(!curWindow.isKiosk());
    }
});

windowShortCutKey.register({
    name: "settings window",
    key: getKeyIndex("window", "settings window").key,
    modifier: getKeyIndex("window", "settings window").modifier,
    handler: launchWindow.settings
});

windowShortCutKey.register({
    name: "screenshot window",
    key:  getKeyIndex("window", "screenshot window").key,
    modifier:  getKeyIndex("window", "screenshot window").modifier,
    handler: launchWindow.screenshot
});

windowShortCutKey.register({
    name: "podcast window",
    key: getKeyIndex("window", "podcast window").key,
    modifier: getKeyIndex("window", "podcast window").modifier,
    handler: launchWindow.podcast
});

module.exports = windowShortCutKey;
