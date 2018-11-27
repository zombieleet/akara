"use strict";

const {
    remote: {
        dialog,
        Menu,
        MenuItem
    }
} = require("electron");

const {
    savepodcast,
    removepodcast
} = require("./PodcastSettings.js");

const {
    applyButtonConfig
} = require("../../js/video_control.js");

const podcastUtility = require("../../js/Podcast/PodcastUtils.js");

/**
   build widgets and also handle events related
   to each podcast created by a podcaster
**/

const podcast =  {};


/**
   __addpodcast Modal creates the modal that the user will input the links
   to any rss feed
**/

// phat arrow function isa bish when using dis, it lexshically bands to the scalling scope
podcast.__addpodcastModal = function() {

    const podcastModal = this.podcastModal = document.createElement("div");
    const podcastMParent = this.podcastMParent = document.createElement("div");

    const info = this.info = document.createElement("p");

    const addpodcastArea = this.addpodcastArea = document.createElement("input");
    const podcastBtns = this.podcastBtns = document.createElement("div");

    const addpodcastAdd = this.addpodcastAdd  = document.createElement("button");
    const addpodcastCancel = this.addpodcastCancel = document.createElement("button");

    const coverView = this.coverView = document.createElement("div");

    podcastModal.setAttribute("class", "podcast-modal");
    podcastMParent.setAttribute("class", "podcast-modal-parent");

    info.setAttribute("class", "podcast-modal-info");

    addpodcastArea.setAttribute("class", "podcast-modal-addpodcastarea");
    addpodcastArea.setAttribute("data-prevent-shortcut", "true");

    podcastBtns.setAttribute("class", "podcast-modal-btn");

    addpodcastAdd.setAttribute("class", "podcast-modal-add");
    addpodcastCancel.setAttribute("class", "podcast-modal-cancel");


    coverView.setAttribute("class", "cover-view");
    addpodcastArea.type = "text";
    addpodcastAdd.textContent = "Add";
    addpodcastCancel.textContent = "Cancel";
    info.textContent = "input podcast url, separate each urls with comma";


    podcastBtns.appendChild(addpodcastAdd);
    podcastBtns.appendChild(addpodcastCancel);

    podcastMParent.appendChild(info);
    podcastMParent.appendChild(addpodcastArea);
    podcastMParent.appendChild(podcastBtns);


    podcastModal.appendChild(podcastMParent);

    document.body.appendChild(coverView);
    document.body.appendChild(podcastModal);

    this.__addpodcastAddEvent = this.__savePodcast.bind(this);
    this.__addpodcastCancelEvent = this.__cancelPodcast.bind(this);

    addpodcastAdd.addEventListener("click", this.__addpodcastAddEvent);
    addpodcastCancel.addEventListener("click", this.__addpodcastCancelEvent);

};

/**
__savePodcast is called whenever the user clicks on the add button
in the addpocast modal
**/

podcast.__savePodcast = function ()  {

    const { value }  = this.addpodcastArea;

    if ( /^\s{0,}$/.test(value) ) {
        console.log("reject");
        dialog.showErrorMessage("empty inputs are not allowed");
        return ;
    }

    let podcasts = value.split(",");
    let modalDiv = document.querySelector(".podcast-modal");
    let spinDiv = document.createElement("div");
    let spin = document.createElement("spin");
    let logMessage = document.createElement("p");

    spinDiv.setAttribute("class", "podcast-spin-saving");
    logMessage.setAttribute("class", "podcast-spin-log");

    spinDiv.appendChild(spin);
    spinDiv.appendChild(logMessage);


    // apply ui button fonts here
    spin.setAttribute("class", "fa fa-spinner fa-pulse fa-5x podcast-spinning-save");

    modalDiv.appendChild(spinDiv);

    const _savepodcast = savepodcast(podcasts, (err,succ,obj) => {

        console.log(err,succ,obj);

        if ( ! err && ! succ ) {
            logMessage.textContent = obj.message;
            return;
        }

        if ( err ) {

            logMessage.textContent = `${err.message} ${err.moreMessage}`;

            if ( err.isDone ) {
                setTimeout( () => {
                    spinDiv.remove();
                    spinDiv = null;
                    this.__removeModal();
                }, 5000);

            }

            return ;
        }

        podcastUtility.appendChannelToDom(succ);

        if ( succ.isDone ) {
            spinDiv.remove();
            this.__removeModal();
        }

        return ;
    });


};

/**
__cancelPodcast is called whenever the user clicks on cancel in the modal,
this method removes the modal from the dom
 **/

podcast.__cancelPodcast = function () { return  this.__removeModal(); };

/**
removes the modal from the dom tree
**/

podcast.__removeModal = function () {
    this.addpodcastAdd.removeEventListener("click", this.__addpodcastAddEvent);
    this.addpodcastCancel.removeEventListener("click", this.__addpodcastCancelEvent);
    this.coverView.remove();
    return this.podcastModal.remove();
};

/**
the section the user is in currently.
may be the main podcast window, or the window where all the podcasts in a
channel is presented
**/

podcast.__currentSection = function () {

    let podWidg = document.querySelector(".podcastload-main");

    if ( podWidg.style.display === "none" ) {
        podWidg = document.querySelector(".podcaster-podcast");
    }

    return podWidg;
};

/**
calls __addpodcastModal method
**/
podcast.podcastadd = function () { return this.__addpodcastModal(); };

/**
removes checked podcast channel from the dom
**/

podcast.podcastremove = function () {

    let podWidg = podWidg.querySelectorAll(`.podcastload-main > li`);

    Array.from(podWidg, channel => {

        const checked = channel.querySelector("[data-current-podcast=check]");

        if ( ! checked )
            return ;

        removepodcast(channel.getAttribute("data-podcast"));
        channel.remove();
    });
};

/**
   creates a menu that presents the user weather to check all podcast channel or to uncheck all podcast channel
**/

podcast.podcastcheck = function () {

    const podWidg = this.__currentSection();

    const checkMenus = [
        {
            label: "checkall",
            enabled: localStorage.getItem("PODCAST::DISABLE_MENU") === "0" ? false : true,
            click() {

                const selectAllChannels = podWidg.querySelectorAll("[data-current-podcast=uncheck]");

                Array.from(selectAllChannels)
                    .forEach( notchecked => {
                        notchecked.removeAttribute("class");
                        notchecked.setAttribute("data-current-podcast", "check");
                        applyButtonConfig(notchecked, "podcast-buttons", "check");
                        console.log(notchecked);
                    });

                localStorage.setItem("PODCAST::DISABLE_MENU", 0);
            },
            accelerator: "Alt+C"
        } ,
        {
            label: "uncheckall",
            enabled: localStorage.getItem("PODCAST::DISABLE_MENU") === "1" ? false : true,
            click() {

                const unselectAllChannels = podWidg.querySelectorAll("[data-current-podcast=check]");

                Array.from(unselectAllChannels)
                    .forEach( checked => {
                        checked.removeAttribute("class");
                        checked.setAttribute("data-current-podcast", "uncheck");
                        applyButtonConfig(checked, "podcast-buttons", "uncheck");
                    });

                localStorage.setItem("PODCAST::DISABLE_MENU", 1);

            },
            accelerator: "Alt+Shift+C"
        }
    ];

    const menu = new Menu();

    menu.clear();

    checkMenus.forEach( _menu => {
        menu.append(new MenuItem(_menu));
    });

    menu.popup({async: true});
};

podcast.podcasthome = function () {

    const podcastMain = document.querySelector(".podcastload-main");
    const podcastPodcaster = document.querySelector(".podcastload-podcaster");

    podcastPodcaster.style.display = null;
    podcastMain.style.display = null;
};

/**
   shake the window when moving from grid to list view
**/

podcast.__views = function ( type ) {

    const podcastSection = document.querySelector("section");
    const podcastMain = document.querySelector(".podcastload-main");


    if( podcastSection.getAttribute("data-view") === type )
        return ;

    podcastSection.setAttribute("data-view", type);

    if ( podcastMain.hasAttribute("data-view-anim") )
        podcastMain.removeAttribute("data-view-anim");


    podcastMain.style.opacity = 0;

    setTimeout( () => {
        podcastMain.setAttribute("data-view-anim", "animation");
    },50);
};

podcast.podcastgrid = function () { return this.__views("grid"); };

podcast.podcastlist = function () { return this.__views("list"); };


/**
   avoid overwriting of this methods by a plugin writter
**/

Object.defineProperties( podcast , {
    __addpodcastModal: {
        enumerable: false,
        writable: false,
        configurable: false
    },
    __currentSection: {
        enumerable: false,
        writable: false,
        configurable: false
    },
    __savePodcast: {
        enumerable: false,
        writable: false,
        configurable: false
    },
    __cancelPodcast: {
        enumerable: false,
        writable: false,
        configurable: false
    },
    __removeModal: {
        enumerable: false,
        writable: false,
        configurable: false
    },
    __views: {
        enumerable: false,
        writable: false,
        configurable: false
    }
});

module.exports = podcast;
