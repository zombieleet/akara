const ffbinaries = require("ffbinaries");

const DESTINATION = `${__dirname}/node_modules/.bin/`;

const download = [ "ffmpeg", "ffserver", "ffplay", "ffprobe" ];

function downloadBin(arg) {
    if ( ! arg ) {
        ffbinaries.downloadFiles(download, { quiet: false, destination: DESTINATION }, () => {
            console.log("Downloaded ffmpeg to %s", DESTINATION);
        });
        return ;
    }

    ffbinaries.downloadFiles(download, { platform: arg, quiet: false, destination: DESTINATION  }, () => {
        console.log("Downloaded ffmpeg to %s", DESTINATION);
    });
}

downloadBin(process.argv.slice(2)[0]);
