( () => {

    "use strict";

    const mime = require("mime");

    const {
        video
    } = require("../js/video_control.js");

    const {
        addMediaCb
    } = require("../js/dropdown_callbacks.js");
    
    const {
        readSubtitleFile
    } = require("../js/util.js");

    const akara_emit = require("../js/emitter.js");

    const {
        ipcRenderer: ipc,
        remote: {
            BrowserWindow,
            require: _require
        }
    } = require("electron");

    const { requireSettingsPath } = _require("./constants.js");
    
    const {
        addMediaFile,
        addMediaFolder,
        search,
        _play,
        _stop,
        _pause,
        _next,
        _previous,
        _setPlaybackRate,
        _enterfullscreen,
        _leavefullscreen,
        showMediaInfoWindow,
        loadplaylist
    } = require("../js/handle_dropdown_commands.js")();
  
    const {
        fireControlButtonEvent,
        videoLoadData,
        dbClickEvent,
        mouseNotHoverVideo,
        mouseMoveOnVideo,
        updateTimeIndicator,
        videoPauseEvent,
        videoPlayEvent,
        videoLoadedEvent,
        setTime,
        videoErrorEvent,
        contextMenuEvent,
        clickedMoveToEvent,
        mouseMoveShowCurrentTimeEvent,
        removeHoverTime,
        mouseDownDragEvent,
        moveToDragedPos,
        handleVolumeChange,
        handleVolumeWheelChange,
        lowHighVolume,
        subHandler,
        showSubtitle,
        showFileLocation,
        loadContextPlaylist,
        contextPlaylist,
        removeContextPlaylist,
        controlDragFullScreen,
        controlMouseEnter,
        controlMouseLeave,
        videoEndedEvent,
        videoSetFilter,
        videoResetFilter
    } = require("../js/videohandlers.js");

    const {
        createNewWindow: playListWindow
    } = _require("./newwindow.js");
    
    const fs = require("fs");

    const currTimeUpdate = document.querySelector(".akara-update-cur-time"),
        jumpToSeekElement = document.querySelector(".akara-time"),
        akaraVolume = document.querySelector(".akara-volume"),
        akaraControl = document.querySelector(".akara-control"),
        controlElements = akaraControl.querySelector(".akara-control-element");



    controlElements.addEventListener("click", fireControlButtonEvent);

    video.addEventListener("loadeddata",videoLoadData);
    video.addEventListener("dblclick", dbClickEvent);
    video.addEventListener("mousemove", mouseMoveOnVideo);
    video.addEventListener("timeupdate", updateTimeIndicator);
    video.addEventListener("ended", videoEndedEvent);
    video.addEventListener("pause", videoPauseEvent );
    video.addEventListener("play", videoPlayEvent );
    video.addEventListener("loadstart", videoLoadedEvent);
    video.addEventListener("loadedmetadata", () => {
        currTimeUpdate.textContent = setTime();
    });
    video.addEventListener("error", videoErrorEvent);
    video.addEventListener("contextmenu", contextMenuEvent);
    
    jumpToSeekElement.addEventListener("click", clickedMoveToEvent);
    jumpToSeekElement.addEventListener("mousemove", mouseMoveShowCurrentTimeEvent);
    jumpToSeekElement.addEventListener("mouseout", removeHoverTime);
    jumpToSeekElement.addEventListener("mousedown", mouseDownDragEvent);
    jumpToSeekElement.addEventListener("mouseup", () => {
        jumpToSeekElement.removeEventListener(
            "mousemove",
            moveToDragedPos
        );
    });

    akaraVolume.addEventListener("click", handleVolumeChange);
    akaraVolume.addEventListener("mousewheel", handleVolumeWheelChange);
    
    akara_emit.on("video::volume", lowHighVolume);

    ipc.on("video-open-file", addMediaFile);
    ipc.on("video-open-folder", addMediaFolder);
    ipc.on("video-play", _play);
    ipc.on("video-pause", _pause);
    ipc.on("video-stop", _stop);
    ipc.on("video-next", _next);
    ipc.on("video-previous", _previous);
    ipc.on("video-repeat", () => video.loop = true );
    ipc.on("video-no-repeat", () => video.loop = false );
    ipc.on("video-open-external", showFileLocation);
    
    ipc.on("normal-speed", () => _setPlaybackRate(1));
    
    requireSettingsPath("playbackrate.json").
        then( playbackFile => {
            const { fast,veryfast,slow,veryslow } = require(playbackFile);
            ipc.on("fast-speed", () => _setPlaybackRate(fast));
            ipc.on("very-fast-speed", () => _setPlaybackRate(veryfast));
            ipc.on("slow-speed", () => _setPlaybackRate(slow));
            ipc.on("very-slow-speed", () => _setPlaybackRate(veryslow));
        });
    
    ipc.on("subtitle::load-sub", subHandler );
    ipc.on("enter-video-fullscreen", _enterfullscreen);
    ipc.on("leave-video-fullscreen", _leavefullscreen);
    ipc.on("video-search", search);
    //ipc.on("media-info", showMediaInfoWindow);
    ipc.on("akara::podcasturl", (evt,path,category) => addMediaCb(path,category));
    ipc.on("akara::video:filter", videoSetFilter);
    ipc.on("akara::video:filter:reset", videoResetFilter);
    ipc.on("akara::video:filter:reset:all",  () => {
        video.style.filter = "unset";
        akara_emit.emit("akara::processStatus", `video filter unset`, true);
    });
    ipc.on("akara::playlist:import", loadplaylist);
    ipc.on("akara::video:poster:change", (evt,poster) => {
        video.poster = poster;
    });
    
    akaraControl.addEventListener("mousedown", controlDragFullScreen);
    akaraControl.addEventListener("mouseenter", controlMouseEnter);
    akaraControl.addEventListener("mouseleave", controlMouseLeave);
    
    akara_emit.on("video::show_subtitle", showSubtitle);
    
    akara_emit.on("akara::playlist", videoContextMenu => {

        const {
            playlist: {
                file: playlistLocation
            }
        } = _require("./configuration.js");

        let submenu ;

        if ( ( submenu = contextPlaylist(videoContextMenu) ) ) {
            Object.assign(videoContextMenu[27], {
                submenu
            });
            return ;
        }

        if ( ( submenu  = loadContextPlaylist(videoContextMenu,playlistLocation) ) ) {
            Object.assign(videoContextMenu[28], {
                submenu
            });
            return ;
        }
    });

})();
