const gulp = require("gulp");
const eslint = require("gulp-eslint");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const gulpIf = require("gulp-if");
const sourcemaps = require("gulp-sourcemaps");

function isFormated(file) {
    console.log(file.eslint.fixed);
    return file.eslint !== null && file.eslint.fixed;
}

gulp.task("eslint", () => {
    gulp.src("./src/**/*.js")
        .pipe(eslint({
            fix: true,
            configFile: "./.eslintrc.json"
        }))
        .on("error", error => console.log(error))
        .pipe(eslint.formatEach())
        .pipe(gulpIf(isFormated, gulp.dest("./app/")));
});


gulp.task("pug", () => {
    return gulp.src("src/renderer/pug/*.pug")
        .pipe(pug())
        .pipe(gulp.dest("./app/"));
});


gulp.task("sass", () => {
    return gulp.src("src/renderer/scss/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: "extended"}).on("error", sass.logError))
        .pipe(sourcemaps.write("app/renderer/maps/"))
        .pipe(gulp.dest("./app/"));
});


gulp.task("watch", () => {
    return gulp.watch(["**/**/js/*.js", "!node_modules/**", "app/renderer/code/scss/*.scss", "app/renderer/code/pug/*.pug"], ["eslint","pug", "sass"]);
    
});


gulp.task("default", [ "eslint", "pug", "sass" , "watch" ]);
