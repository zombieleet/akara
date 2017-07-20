
const { remote: { dialog } } = require("electron");
const { validateMime, showMediaInApp } = require("../js/util.js");

const addMediaCb = paths => {

    if ( ! paths ) return false;
    

    paths.forEach( async (path) => {
        
        const gen = await validateMime(path);

        let { value } = gen.next();
        

        while ( value ) {

            const path = await value;

            showMediaInApp(path);
            
            require("child_process").execSync("echo hi ; sleep 2");
            
            ({value} = gen.next());
        }
    });
};

module.exports = {
    addMediaCb
};
