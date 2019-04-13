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
; ( () => {

    "use strict";

    const {
        ipcRenderer: ipc,
        remote: {
            BrowserWindow,
            dialog,
            require: _require
        }
    } = require("electron");


    const { video }  = require("../js/VideoControl.js");
    const { addMediaCb } = require("../js/DropdownCallbacks.js");
    const { requireSettingsPath } = _require("./constants.js");
    const { readSubtitleFile, uploadYoutubeVideo } = require("../js/Util.js");
    const { createNewWindow: playListWindow } = _require("./newwindow.js");


    const currTimeUpdate       = document.querySelector(".akara-update-cur-time");
    const akaraTimeIndicator    = document.querySelector(".akara-time");
    const akaraVolume          = document.querySelector(".akara-volume");
    const akaraControl         = document.querySelector(".akara-control");
    const controlElements      = akaraControl.querySelector(".akara-control-element");
    const dropDownMenuCommands = require("../js/HandleDropdownCommands.js")();


    const fs           = require("fs");
    const mime         = require("mime");
    const url          = require("url");
    const akara_emit   = require("../js/Emitter.js");
    const videoHandler = require("../js/VideoHandlers.js");

    controlElements.addEventListener("click", videoHandler.fireControlButtonEvent);

    video.addEventListener("loadeddata", videoHandler.videoLoadData);
    video.addEventListener("dblclick", videoHandler.setFullScreen);
    video.addEventListener("mousemove", videoHandler.mouseMoveOnVideo);
    video.addEventListener("timeupdate", videoHandler.updateTimeIndicator);
    video.addEventListener("ended", videoHandler.videoEndedEvent);
    video.addEventListener("pause", videoHandler.videoPauseEvent );
    video.addEventListener("play", videoHandler.videoPlayEvent );
    video.addEventListener("loadstart", videoHandler.videoLoadedEvent);
    video.addEventListener("loadedmetadata", () => {
        currTimeUpdate.textContent = videoHandler.setTime();
    });

    video.addEventListener("error", videoHandler.videoErrorEvent);
    video.addEventListener("contextmenu", videoHandler.contextMenuEvent);
    video.addEventListener("progress", videoHandler.mediaProgress);
    video.addEventListener("seeking", videoHandler.mediaProgress);

    video.addEventListener("volumechange", evt => {

        const volumeSettingPath = requireSettingsPath("volume.json");
        const volumeSettings = require(volumeSettingPath);

        if ( volumeSettings.volume_warn_exceed_max && volumeSettings.volume_default_level > volumeSettings.volume_max_level ) {

            if ( Boolean(localStorage.getItem("DONT_SHOW_VOLUME_WARNING")) === true )
                return ;

            dialog.showMessageBox({
                type: "warning",
                title: "Too Much Volume",
                message: `video volume exceeds ${volumeSettings.volume_max_level}%`,
                buttons: [ "Cancel" ]
            });

            localStorage.setItem("DONT_SHOW_VOLUME_WARNING", true);
        }
    });

    video.addEventListener("waiting", videoHandler.mediaWating);

    akaraTimeIndicator.addEventListener("click", videoHandler.clickedMoveToEvent);
    akaraTimeIndicator.addEventListener("mousemove", videoHandler.mouseMoveShowCurrentTimeEvent);
    akaraTimeIndicator.addEventListener("mouseout", videoHandler.removeHoverTime);
    akaraTimeIndicator.addEventListener("mousedown", videoHandler.mouseDownDragEvent);

    akaraTimeIndicator.addEventListener("mouseup", () => {
        akaraTimeIndicator.removeEventListener(
            "mousemove",
            videoHandler.moveToDragedPos
        );
    });

    akaraTimeIndicator.addEventListener("contextmenu", videoHandler.videoFragment);

    akara_emit.on("akara::media:fragment:unset", type => {
        localStorage.removeItem(`MEDIA_FRAGMENT_${type}`);
    });

    akara_emit.on("akara::media:fragment:set", ( { type , time } ) => {
        localStorage.setItem(`MEDIA_FRAGMENT_${type}`, time);
    });


    akaraVolume.addEventListener("click", videoHandler.handleVolumeChange);
    akaraVolume.addEventListener("mousewheel", videoHandler.handleVolumeWheelChange);

    akara_emit.on("video::volume", videoHandler.lowHighVolume);

    ipc.on("video-open-file", dropDownMenuCommands.addMediaFile);
    ipc.on("video-open-folder", dropDownMenuCommands.addMediaFolder);
    ipc.on("video-play",dropDownMenuCommands._play);
    ipc.on("video-pause",dropDownMenuCommands._pause);
    ipc.on("video-stop",dropDownMenuCommands._stop);
    ipc.on("video-next",dropDownMenuCommands._next);
    ipc.on("video-previous", dropDownMenuCommands._previous);


    ipc.on("video-repeat", () =>  {
        video.loop = true;
        localStorage.setItem("LOOP_CURRENT_VIDEO", video.getAttribute("data-id"));
    });

    ipc.on("video-no-repeat", () => {
        video.loop = false;
        localStorage.removeItem("LOOP_CURRENT_VIDEO");
    });

    ipc.on("video-open-external", videoHandler.showFileLocation);

    ipc.on("normal-speed", () => dropDownMenuCommands._setPlaybackRate(1));

    Promise.resolve(requireSettingsPath("playbackrate.json")).
        then( playbackFile => {
            const { fast,veryfast,slow,veryslow } = require(playbackFile);
            ipc.on("fast-speed", () => dropDownMenuCommands._setPlaybackRate(fast));
            ipc.on("very-fast-speed", () => dropDownMenuCommands._setPlaybackRate(veryfast));
            ipc.on("slow-speed", () => dropDownMenuCommands._setPlaybackRate(slow));
            ipc.on("very-slow-speed", () => dropDownMenuCommands._setPlaybackRate(veryslow));
        });

    ipc.on("subtitle::load-sub", videoHandler.subHandler );
    ipc.on("enter-video-fullscreen", dropDownMenuCommands._enterfullscreen);
    ipc.on("leave-video-fullscreen", dropDownMenuCommands._leavefullscreen);
    ipc.on("video-search", dropDownMenuCommands.search);

    ipc.on("media-info", dropDownMenuCommands.showMediaInfoWindow);

    ipc.on("akara::video::currentplaying", (evt,winid,fromPlist) => {

        if ( fromPlist ) {
            ipc.sendTo(winid, "akara::video::currentplaying:src", localStorage.getItem("akara::mediainfo:playlist_section"));
            localStorage.removeItem("akara::mediainfo:playlist_section");
            return ;
        }

        ipc.sendTo(winid, "akara::video::currentplaying:src", video.src);
    });

    ipc.on("akara::podcast:play", (evt,podmetadata,category) => {
        const { episode: { enclosure: { url } } } = JSON.parse(podmetadata);
        localStorage.setItem("podcast-metadata", podmetadata);
        addMediaCb(decodeURIComponent(url),category);
    });

    ipc.on("akara::video:filter", videoHandler.videoSetFilter);
    ipc.on("akara::video:filter:reset", videoHandler.videoResetFilter);
    ipc.on("akara::video:filter:reset:all",  () => {
        video.style.filter = "unset";
        akara_emit.emit("akara::processStatus", `video filter unset`, true);
    });
    ipc.on("akara::playlist:import", dropDownMenuCommands.loadplaylist);
    ipc.on("akara::video:poster:change", (evt,poster) => {
        video.poster = poster;
    });

    ipc.on("akara::youtube:loggedin:share", (evt,youtubeClient) => {
        const request = require("request");
        youtubeClient.request = request;
        uploadYoutubeVideo(youtubeClient);
    });

    ipc.on("akara::send:media:file", (evt,id) => {
        evt.sender.sendTo(id,"akara::media:file", video.getAttribute("src"));
    });

    ipc.on("akara::subtitle:style:change", (evt,cssProps,cssValue) => {

        const tracks = document.querySelectorAll("track");

        if ( tracks.length === 0 )
            return;

        const { webContents } = BrowserWindow.fromId(1);

        webContents.insertCSS(`
          ::cue {
            ${cssProps}: ${cssValue};
          }
       `);
    });

    ipc.on("plugin::remove:subtitle:file", (evt,winId,subtitleIds) => {

        const allTracks = document.querySelectorAll("track");

        if ( ! allTracks.length ) {
            ipc.sendTo( winId , "plugin::subtitle:no:subtitle");
            return;
        }

        for ( let subtitle of subtitleIds ) {
            const trackEl = Array.from(allTracks).find( x => Number(x.getAttribute("id")) === subtitle );
            if ( trackEl ) trackEl.remove();
            akara_emit.emit("video::subtitle:shortcut:remove", subtitle);
            ipc.sendTo( winId , "plugin::subtitle:file:removed", subtitle);
        }
    });

    akaraControl.addEventListener("mousedown", videoHandler.controlDragFullScreen);
    akaraControl.addEventListener("mouseenter", videoHandler.controlMouseEnter);
    akaraControl.addEventListener("mouseleave", videoHandler.controlMouseLeave);

    akara_emit.on("video::show_subtitle", videoHandler.showSubtitle);

    akara_emit.on("akara::playlist", videoContextMenu => {

        const {
            playlist: {
                file: playlistLocation
            }
        } = _require("./configuration.js");

        let submenu ;

        if ( ( submenu = videoHandler.contextPlaylist(videoContextMenu) ) ) {
            Object.assign(videoContextMenu[27], {
                submenu
            });
            return ;
        }

        if ( ( submenu  = videoHandler.loadContextPlaylist(videoContextMenu,playlistLocation) ) ) {
            Object.assign(videoContextMenu[28], {
                submenu
            });
            return ;
        }
    });

})();
