const KEY_BINDINGS = require("../js/key.js");

/**
 * AkaraKey Class handles the registeration of keyevents
 **/
class AkaraKey  {
    constructor() {
        
        this.stack = {};
        this.KEY_BINDINGS = KEY_BINDINGS;
        this.err = new Error();

        document.body.addEventListener("keyup", evt => {
            const exeCute = this.stack[this.KEY_BINDINGS[`_${evt.keyCode}`]];
            if ( exeCute )
                exeCute(evt);
        });
        
    }
    
    /**
     *
     *
     * register a keyevent with key as the key 
     *   and cb as the handler
     *
     **/
    
    register(key,cb) {

        if ( typeof(key) !== "string" ) {
            this.err.name = "key binding is not a string";
            this.err.message = `Expected key binding to be a string but got ${typeof(key)}`;
            throw this.err;
        }

        if ( typeof(cb) !== "function" ) {
            this.err.name = `${key} event handler is not a function`;
            this.err.message = `Expected a function for event handler but got ${typeof(cb)}`;
            throw this.err;
        }

        if ( this.search(key) ) {
            throw new AkaraKey(`${key} already exists`);
        }

        this.stack[key] = cb;

    }
    
    /**
     *
     *
     * remove a registerred key
     *
     *
     **/
    
    remove(key) {
        if ( this.search(key) ) {
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
    
    search(key) {
        return Object.keys(this.stack).indexOf(key) !== -1;
    }
}

module.exports = AkaraKey;
