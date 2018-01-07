const ffbinaries = require("ffbinaries");

const fs = require("fs");
const path = require("path");
const os = require("os");
const assert = require("assert");
const wait = require("wait.for-es6");

var extractZip = require('extract-zip');

const DESTINATION = `${__dirname}/node_modules/.bin/`;

const binaries = [ "ffmpeg", "ffprobe" ];

const args = process.argv.slice(2);

const platforms = [ "linux-64", "linux-32", "linux-armhf", "linux-armel", "osx", "win-32", "win-64" ];

function * downloadBin() {

    const cache_dir = path.join(os.homedir(), ".ffbinaries-cache");


    for ( let platform of platforms ) {
        
        for ( let binary of binaries ) {
            
            let data = yield wait.for(ffbinaries.downloadFiles, binary, { platform , quiet: false, destination: DESTINATION });

            console.log(data);
            
            let ffpath = path.join(DESTINATION, binary);
            
            if ( fs.existsSync(ffpath) ) {
                fs.rename(ffpath, path.join(DESTINATION, `${binary}-${platform}`) , err => {
                    console.log( err ? err : "renamed succesfully");
                });
                continue;
            }
            
            ffpath = path.join(DESTINATION, `${binary}.exe`);
            
            if ( fs.existsSync(ffpath) ) {
                fs.rename(ffpath, path.join(DESTINATION, `${binary}-${platform}.exe`) , err => {
                    console.log( err ? err : "renamed succesfully");
                });
                continue ;
            }
            
        };
    }
    
}

wait.launchFiber(downloadBin);
