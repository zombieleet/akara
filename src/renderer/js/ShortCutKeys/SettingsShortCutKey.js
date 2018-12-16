"use strict";


const settingWindowKey  = new (require("../../js/Keyevents.js"));
const openSettingWindow = require("../../js/SettingsWindow.js");

const {
    getKeyIndex
} = require("../../js/Util.js");

settingWindowKey.register({
    name: "playbackrate settings",
    key: getKeyIndex("settings", "playbackrate settings").key,
    modifier: getKeyIndex("settings", "playbackrate settings").modifier,
    handler: openSettingWindow.playbackrate
});

settingWindowKey.register({
    name: "filter settings",
    key: getKeyIndex("settings", "filter settings").key,
    modifier: getKeyIndex("settings", "filter settings").modifier,
    handler: openSettingWindow.filter
});

settingWindowKey.register({
    name: "fullscreen settings",
    key: getKeyIndex("settings", "fullscreen settings").key,
    modifier: getKeyIndex("settings", "fullscreen settings").modifier,
    handler: openSettingWindow.filter
});

settingWindowKey.register({
    name: "play option settings",
    key: getKeyIndex("settings", "play option settings").key,
    modifier: getKeyIndex("settings", "play option settings").modifier,
    handler: () => { /** play option**/ }
});

settingWindowKey.register({
    name: "volume settings",
    key: getKeyIndex("settings", "volume settings").key,
    modifier: getKeyIndex("settings", "volume settings").modifier,
    handler: openSettingWindow.volume
});

settingWindowKey.register({
    name: "poster settings",
    key: getKeyIndex("settings", "poster settings").key,
    modifier: getKeyIndex("settings", "poster settings").modifier,
    handler: openSettingWindow.poster
});

settingWindowKey.register({
    name: "audio type settings",
    key: getKeyIndex("settings", "audio type settings").key,
    modifier: getKeyIndex("settings", "audio type settings").modifier,
    handler: () => { /** audio type**/ }
});

settingWindowKey.register({
    name: "button settings",
    key: getKeyIndex("settings", "button settings").key,
    modifier: getKeyIndex("settings", "button settings").modifier,
    handler: openSettingWindow.buttons
});

settingWindowKey.register({
    name: "themes",
    key: getKeyIndex("settings", "themes").key,
    modifier: getKeyIndex("settings", "themes").modifier,
    handler: () => { /** themes **/ }
});

settingWindowKey.register({
    name: "plugin",
    key: getKeyIndex("settings", "plugin").key,
    modifier: getKeyIndex("settings", "plugin").modifier,
    handler: () => { /** plugin install **/ }
});


settingWindowKey.register({
    name: "power settings",
    key: getKeyIndex("settings", "power settings").key,
    modifier: getKeyIndex("settings", "power settings").modifier,
    handler: openSettingWindow.powersettings
});

settingWindowKey.register({
    name: "share settings",
    key: getKeyIndex("settings", "share settings").key,
    modifier: getKeyIndex("settings", "share settings").modifier,
    handler: openSettingWindow.filter
});

settingWindowKey.register({
    name: "shortcutkey settings",
    key: getKeyIndex("settings", "shortcutkey settings").key,
    modifier: getKeyIndex("settings", "shortcutkey settings").modifier,
    handler: openSettingWindow.shortcutkeys
});

module.exports = settingWindowKey;
