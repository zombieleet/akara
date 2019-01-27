/* AKM is a highly customizable media player built with electron
   Copyright (C) 2016  Victory Osikwemhe (zombieleet)

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

"use strict";

const windowShortCutKey = new(require(("../../js/Keyevents.js")));
const launchWindow      = require("../../js/HandleDropdownCommands.js")();

const {
    remote: {
        getCurrentWindow
    }
} = require("electron");

const {
    getKeyIndex
} = require("../../js/Util.js");

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
