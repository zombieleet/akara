"use strict";

const fs = require("fs");

const { sendNotification } = require("../../js/Util.js");

const {
    remote: {
        dialog,
        require: _require
    }
} = require("electron");

const  {
    playlist: {
        file: playlistLocation
    }
} = _require("./configuration.js");


const selectMultiple = listLoadParent => {

    listLoadParent.addEventListener("click", evt => {

        let target = evt.target;

        const _case = target.nodeName.toLowerCase();

        if ( _case === "ul"  ) return false;

        target = _case === "li" ? target : target.parentNode;



        /**
         *
         * clicked li already has data-load just remove it
         *  as a sign of unclick
         *
         **/

        if ( target.hasAttribute("data-load") ) {
            return target.removeAttribute("data-load");
        }


        /**
         *
         *
         * if ctrlKey is not held down
         * with a left click
         * remove all li element marked with data-load=multiple
         *
         **/

        if ( ! evt.ctrlKey ) {
            removeSelections();
            return target.setAttribute("data-load", "single");
        }


        /**
         *
         * setup multiple selection
         * turn single selection to multiple selection
         *
         **/

        const single = document.querySelector("[data-load=single]");

        target.setAttribute("data-load", "multiple");

        if ( single )
            single.setAttribute("data-load", "multiple");

        return true;

    });
};

const removeSelections = () => {

    Array.from(
        document.querySelectorAll("[data-load]"),
        el => {

        if ( el.getAttribute("data-load") === "multiple" ) {
            el.removeAttribute("data-load");
            return ;
        }

        /**
         *
         * avoid double data-load=single
         *
         **/

        if ( el.getAttribute("data-load") === "single" ) {
            el.removeAttribute("data-load");
            return ;
        }

    });
};


/**
 *
 *
 * saves a playlist
 * key is the name to saveplaylist with
 * files, an array of files
 * notify, is either true or false
 *    to notify if saved or not
 *
 **/


module.exports.playlistSave = (key, files, notify) => {

    const list = require(playlistLocation);

    let savedList = list[key] || [];

    for ( let __list of files ) {
        savedList.push(__list);
    }

    savedList = savedList.sort().filter(
        (value,index,array) => value !== array[++index]
    );

    Object.assign(list, {
        [key]: savedList
    });

    fs.writeFileSync(playlistLocation, JSON.stringify(list));

    if ( ! notify )
        return ;

    sendNotification({title: "Playlist", message: "Playlist have been saved"});

    return ;

};





/**
 *
 *
 * loads a playlist saved with listName
 * it returns the items in listName
 *
 **/

module.exports.playlistLoad = listName => {

    if ( typeof(listName) !== "string" )
        throw TypeError(`expected string as listName but got ${typeof(listName)}`);


    const list = require(playlistLocation);

    if ( ! listName in list )
        return dialog.showErrorBox(
            "unable to load playlist",
            `${listName} could not be loaded`
        );

    let playlistList = list[listName];

    const validPlaylist = playlistList.filter( list => {

        if ( fs.existsSync(decodeURIComponent(list.replace(/^file:\/\//,""))) )
            return list;
        else
            return dialog.showErrorBox("Playlist location not found",`path to ${list} was not found`);
    });

    return validPlaylist;
};





/**
 *
 *
 * deletes playlist and write to
 * the config file
 *
 **/

module.exports.deletePlaylist = listName => {

    let list = require(playlistLocation);

    if ( ! listName in list )
        return false;

    delete list[listName];

    if ( Object.keys(list).length === 0 )
        list = {};

    fs.writeFileSync(playlistLocation, JSON.stringify(list));

    return true;
};



/**
 *
 *
 * renders all playlist name and total
 *   list item to the dom
 *
 **/

module.exports.renderPlayList = type => {

    const loadplaylist = document.querySelector(`.${type}`);

    if ( ! loadplaylist ) {
        return new Error(`wrong argument`,`specified argument as class ${type} cannot be located in the dom`);
    }

    const list = require(playlistLocation);

    if ( Object.keys(list).length === 0 ) {
        const p = document.createElement("p");
        p.textContent = "No Playlist have been created";
        p.setAttribute("class", "no-loadplaylist");
        document.querySelector("button").hidden = true;
        loadplaylist.appendChild(p);
        return false;
    }

    let ul = document.querySelector(".append-list");
    if ( ul )
        return false;

    ul = document.createElement("ul");
    ul.setAttribute("class", "append-list");

    let  noP = loadplaylist.querySelector(".no-loadplaylist");
    if ( noP )
        noP.remove();

    noP = undefined;

    for ( let __list of Object.keys(list) ) {
        const li = document.createElement("li");
        const p = document.createElement("p");
        const numlist = document.createElement("span");
        p.textContent = __list;
        numlist.textContent = `${list[__list].length} files`;
        li.setAttribute("class", "loadplaylist-item");
        li.setAttribute("data-capture", __list);
        li.appendChild(p);
        li.appendChild(numlist);
        ul.appendChild(li);
    }

    loadplaylist.appendChild(ul);
    selectMultiple(ul);
    return true;
};
