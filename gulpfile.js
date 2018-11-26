const { Gulp, src, dest, series} = require("gulp");
const eslint = require("gulp-eslint");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const fs = require("fs");
//const gulpIf = require("gulp-if");
const imagemin = require("gulp-imagemin");

const sourcemaps = require("gulp-sourcemaps");

const path = {
    src: "./src/**/**/*.js",
    configFile: "./.eslintrc.json",
    pugPath: "src/renderer/pug/**/**/*.pug",
    imageminPath: "./src/renderer/img/**/*",
    sassPath: "src/renderer/scss/**/*.scss",

}

const eslintTask = () => {
    return src(path.src)
        .pipe(eslint({
            fix: true,
            configFile: path.configFile
        }))
        .on("error", error => console.error(error))
        .pipe(eslint.format())
        .pipe(dest("./app/"))
        .on("finish", () => {
            console.log("Done");
        });
}

const pugTask = () => {
    return src(path.pugPath)
        .pipe(pug())
        .on("error", error => console.error(error))
        .pipe(dest("./app/renderer/html"))
        .on("finish", () => {
            console.log("Done");
        });
}

const imageminTask = () => {
    return src(path.imageminPath)
        .pipe(imagemin([
            imagemin.svgo({ plugins: [{ removeViewBox: true}]})
        ]))
        .pipe(dest("./app/renderer/img/"));
}

const sassTask = () => {
    return src(path.sassPath)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: "extended"}).on("error", sass.logError))
        .pipe(sourcemaps.write("./maps"))
        .pipe(dest("./app/renderer/css/"))
        .on("finish", () => {
            console.log("Done");
        });
}

const fontawesomeTask = () => {
    return [ src("src/renderer/libs/*")
                .pipe(dest("./app/renderer/libs/")),
            src("src/renderer/fonts/*")
                .pipe(dest("./app/renderer/fonts/"))
    ]
};

const watch = () => {
    Gulp.watch([path.src, "!node_modules/**"], eslintTask);
    Gulp.watch(path.sassPath, sassTask);
    Gulp.watch(path.pugPath, pugTask);
    Gulp.watch(path.imageminPath, imageminTask)
}

exports.eslintTask = eslintTask;
exports.sassTask = sassTask;
exports.pugTask = pugTask;
exports.imageminTask = imageminTask;
exports.watch = watch;


exports.default = series(eslintTask, sassTask, pugTask, imageminTask);