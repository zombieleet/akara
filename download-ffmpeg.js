const ffbinaries = require("ffbinaries");

const fs = require("fs");
const path = require("path");

const DESTINATION = `${__dirname}/node_modules/.bin/`;

const platforms = [ "linux-64", "linux-32", "linux-armhf", "linux-armel", "osx", "win-32", "win-64" ];

function downloadBin() {

    platforms.forEach( plat => {
        
        ffbinaries.downloadFiles("ffmpeg",{ platform: plat, quiet: false, destination: DESTINATION }, (err,data) => {
            
            console.log("Downloaded %s for %s " , JSON.stringify(data), plat);
            
            let _path = path.join(DESTINATION,"ffmpeg") ;
            
            if ( ! fs.existsSync(_path) )
                _path = path.join(DESTINATION,"ffmpeg.exe");
            
            fs.rename(
                _path,
                _path.endsWith(".exe")
                    ? path.join(DESTINATION,`ffmpeg-${plat}.exe`)
                    : path.join(DESTINATION,`ffmpeg-${plat}`) 
                    ,
                err => {
                    console.log( err ? err : "renamed");
                });
        }); 
    });
    
}

downloadBin();
