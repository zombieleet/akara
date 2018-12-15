"use strict";
const { EventEmitter } = require("events");

const akara_emit = new EventEmitter();

// make all events constant
module.exports = akara_emit;
