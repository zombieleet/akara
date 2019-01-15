
"use strict";

const {
    remote: {
        require: _require
    }
} = require("electron");

const { createNewWindow: settingsWindow } = _require("./newwindow.js");

const handleAkaraSettings = {};

handleAkaraSettings.poster = () => {
    const poster = {
        title: "poster",
        maximizable: false,
        resizable: false,
        minimizable: false,
        center: true
    };
    settingsWindow(poster, "settings/poster.html");
};

handleAkaraSettings.powersettings = () => {
    const power = {
        title: "power",
        maximizable: false,
        resizable: false,
        minimizable: false,
        width: 500,
        height: 460,
        center: true
    };
    settingsWindow(power, "settings/powermanagement.html");
};

handleAkaraSettings.playbackrate = () => {
    const playbackrate = {
        title: "playbackrate",
        maximizable: false,
        resizable: false,
        minimizable: false,
        width: 500,
        height: 460,
        center: true
    };
    settingsWindow(playbackrate, "settings/playbackrate.html");
};

handleAkaraSettings.filter = () => {
    const filter = {
        title: "filter",
        maximizable: false,
        resizable: false,
        minimizable: false,
        width: 408,
        height: 1000
    };
    settingsWindow(filter, "filter.html");
};

handleAkaraSettings.share = () => {
    const share = {
        title: "share",
        maximizable: false,
        resizeable: false,
        minimizable: false,
        width: 500,
        height: 450,
        center: true
    };
    settingsWindow(share, "settings/share.html");
};

handleAkaraSettings.volume = () => {
    const volume = {
        title: "volume",
        maximizable: false,
        resizeable: false,
        minimizable: false,
        width: 500,
        height: 450,
        center: true
    };
    settingsWindow(volume, "settings/volume.html");
};


handleAkaraSettings.buttons = () => {
    const button = {
        title: "ui buttons",
        maximizable: true,
        resizable: true,
        minimizable: true,
        width: 500,
        height: 450,
        center: true
    };
    settingsWindow(button, "settings/ui_button.html");
};

handleAkaraSettings.shortcutkeys = () => {
    const shortcutkeys = {
        title: "ShortCut Keys",
        maximizable: true,
        resizable: true,
        minimizable: true,
        width: 500,
        height: 450,
        center: true
    };
    settingsWindow(shortcutkeys, "settings/shortcutkeys.html");
};

handleAkaraSettings.subtitle = () => {
    const subtitle = {
        title: "Subtitle",
        maximizable: false,
        resizeable: false,
        minimizable: false,
        width: 700,
        height: 700,
        center: true
    };
    settingsWindow(subtitle, "settings/subtitle.html");
};

module.exports = handleAkaraSettings;
