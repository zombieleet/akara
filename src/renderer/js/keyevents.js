
const assert = require("assert");

const crypto = require("crypto");

const akara_emit = require("../js/emitter.js");


/**
 * AkaraKey Class handles the registeration of keyevents
 **/


// TODO: Accept array of modifiers

class AkaraKey  {

    constructor() {

        this.stack = {};

        document.body.addEventListener("keyup", this.__eventHandler.bind(this));

    }

    __eventHandler(evt) {

        if ( HTMLTextAreaElement[Symbol.hasInstance](evt.target) )
            return false;

        const {
            key
        } = evt;

        let isSpace = /^\s+$/.test(key);

        let execute ;

        let modifierKeys = ["altKey", "ctrlKey", "metaKey", "shiftKey" ]
                .filter(mod => evt[mod] ? mod : undefined);

        console.log(key);
        if ( modifierKeys.length > 0 ) {
            execute = isSpace
                ? this.stack["Space"]
                : this.stack[`${key.toLowerCase()}_${this.__computeHash(modifierKeys)}`];
        } else {
            console.log(this.stack[key], key);
            execute = isSpace
                ? this.stack["Space"]
                : this.stack[key];
        }

        if ( execute )
            return execute.handler(evt);

        return false;

    }

    __makeSearch(key,modifier) {

        if ( this.search(key,modifier) ) {

            if ( modifier )
                throw new Error(`${key} with ${ modifier.join(" ") } modifier already exists`);

            throw new Error(`${key} already exists`);
        }

    }

    __computeHash(modifier) {
        return crypto.createHash("md5").update(modifier.join(" ")).digest("hex").substr(0,8);
    }
    /**
     *
     *
     * register a keyevent with key as the key
     *   and cb as the handler
     *
     **/

    register(opt) {

        assert.strictEqual(
            typeof(opt),
            "object",
            `Expected an object but got a ${typeof(opt)}`
        );

        assert.notStrictEqual(
            Array.isArray(opt),
            true,
            `Expected an object but got a ${typeof(opt)}`
        );

        let {
            modifier,
            key,
            handler,
            name
        } = opt;

        assert.strictEqual(
            typeof(key),
            "string",
            `got typeof ${typeof key} instead of a string for ${name}`
        );

        assert.strictEqual(
            typeof(handler),
            "function",
            `expected function as last argument but got ${typeof(handler)} for ${name}`
        );

        if ( modifier ) {

            if ( modifier.length > 0 ) {

                assert.strictEqual(
                    Array.isArray(modifier),
                    true,
                    `got type of ${typeof key} instead of an array`
                );

                this.hash = this.__computeHash(modifier);
                this.__makeSearch(key,modifier);
                this.stack[`${key.toLowerCase()}_${this.hash}`] = opt;
                this.hash = undefined;

                return true;
            }
            this.__makeSearch(key,modifier);
            this.stack[key] = opt;
            return true;
        }
        // executing of this routine should not reach this branch of code
        return false;

    }

    /**
     *
     *
     * remove a registerred key
     *
     *
     **/

    unregister({key,modifier}) {

        if ( this.search(key,modifier) ) {

            if ( modifier.length > 0 )
                delete this.stack[`${key}_${this.__computeHash(modifier)}`];
            else
                delete this.stack[key];

            return true;
        }
        return false;
    }

    /**
     *
     *
     * list all added key events
     *
     **/

    list() {
        return this.stack;
    }

    /**
     *
     *
     * search for key
     *
     **/

    __find(key) {

        let value = Object.keys(this.stack).find(
            __key => __key === key
        );

        return value;
    }

    search(key,modifier) {

        if ( modifier.length > 0 )
            key = `${key}_${this.__computeHash(modifier)}`;

        let value = this.__find(key);

        if ( ! value )
            return false;

        return Object.keys(this.stack).indexOf(key) > -1;

    }
}

module.exports = AkaraKey;
