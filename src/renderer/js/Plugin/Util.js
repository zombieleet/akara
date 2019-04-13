
"use strict";

const validatePaths = (paths) => {

    if ( ! paths ) {
        throw new Error(`expect first argument to be an array or a string but got undefined`);
    }

    if ( typeof(paths) === "object" && ! Array.isArray(paths) ) {
        throw new Error(`expect first argument to be an array or a string but got ${typeof(paths)}`);
    }

    if ( Array.isArray(paths) && paths.length === 0 ) {
        throw new Error(`paths array is empty`);
    }

    return Array.isArray(paths) ? paths : [ paths ];
};

module.exports.validatePaths = validatePaths;
