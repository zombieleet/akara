const gulp = require("gulp");
const eslint = require("gulp-eslint");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const fs = require("fs");
//const gulpIf = require("gulp-if");
const imagemin = require("gulp-imagemin");

const sourcemaps = require("gulp-sourcemaps");


gulp.task("eslint", () => {
    return gulp.src("./src/**/**/*.js")
        .pipe(eslint({
            fix: true,
            configFile: "./.eslintrc.json"
        }))
        .on("error", error => console.log(error))
        .pipe(eslint.format())
        .pipe(gulp.dest("./app/"))
        .on("finish", () => {
            console.log("done");
        });
});


gulp.task("pug", () => {
    return gulp.src("src/renderer/pug/**/**/*.pug")
        .pipe(pug())
        .on("error", error => console.log(error))
        .pipe(gulp.dest("./app/renderer/html/"))
        .on("finish", () => {
            console.log("done");
        });
});

gulp.task("imagemin", () => {
    return gulp.src("./src/renderer/img/**/*")
        .pipe(imagemin([
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(gulp.dest("./app/renderer/img/"));
});

gulp.task("sass", () => {
    return gulp.src("src/renderer/scss/**/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: "extended"}).on("error", sass.logError))
        .pipe(sourcemaps.write("./maps"))
        .pipe(gulp.dest("./app/renderer/css/"))
        .on("finish", () => {
            console.log("done");
        });
});

gulp.task("fontawesome", () => {
    gulp.src("src/renderer/libs/*")
        .pipe(gulp.dest("./app/renderer/libs/"));

    gulp.src("src/renderer/fonts/*")
        .pipe(gulp.dest("./app/renderer/fonts/"));
});

gulp.task("watch", () => {

    gulp.watch(["./src/**/**/*.js", "!node_modules/**"], [ "eslint" ]);
    gulp.watch("./src/renderer/scss/**/*.scss", [ "sass" ]);
    gulp.watch("./src/renderer/pug/**/**/*.pug", [ "pug" ]);
    gulp.watch("./src/renderer/img/**/*", [ "imagemin" ]);

});


gulp.task("default", [ "eslint", "pug", "fontawesome", "sass" , "imagemin", "watch" ]);
