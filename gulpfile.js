const gulp = require("gulp");
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
    sassPath: "src/renderer/scss/**/*.scss"
};

const eslintTask = () => {
    return gulp.src(path.src)
        .pipe(eslint({
            fix: true,
            configFile: path.configFile
        }))
        .on("error", error => console.log(error))
        .pipe(eslint.format())
        .pipe(gulp.dest("./app/"))
        .on("finish", () => {
            console.log("done");
        });
};


const pugTask = () => {
    return gulp.src(path.pugPath)
        .pipe(pug())
        .on("error", error => console.error(error))
        .pipe(gulp.dest("./app/renderer/html"))
        .on("finish", () => {
            console.log("done");
        });
};


const imageminTask = () => {
    return gulp.src(path.imageminPath)
        .pipe(imagemin([
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(gulp.dest("./app/renderer/img/"));
};


const sassTask = () => {
    return gulp.src(path.sassPath)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: "extended"}).on("error", sass.logError))
        .pipe(sourcemaps.write("./maps"))
        .pipe(gulp.dest("./app/renderer/css/"))
        .on("finish", () => {
            console.log("done");
        });
};

const fontawesomeTask = () => {
    return [ gulp.src("src/renderer/libs/*")
             .pipe(gulp.dest("./app/renderer/libs/")),
             gulp.src("src/renderer/fonts/*")
             .pipe(gulp.dest("./app/renderer/fonts/"))
           ];
};

const watch = () => {
    gulp.watch([path.src, "!node_modules/**"], eslintTask);
    gulp.watch(path.sassPath, sassTask);
    gulp.watch(path.pugPath, pugTask);
    gulp.watch(path.imageminPath, imageminTask);
};

exports.eslintTask = eslintTask;
exports.sassTask = sassTask;
exports.pugTask = pugTask;
exports.imageminTask = imageminTask;
exports.watch = watch;
exports.fontawesomeTask = fontawesomeTask;

exports.default = gulp.parallel(eslintTask, sassTask, pugTask, imageminTask, fontawesomeTask, watch);

