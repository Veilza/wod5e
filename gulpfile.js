const gulp = require('gulp')
const less = require('gulp-less')
const path = require('path')
const concat = require('gulp-concat')

// Create a task to take all .less files and convert them into CSS for Foundry
// This includes a pipeline to turn it all into a single file so that hotreload works better
gulp.task('less', function () {
  return gulp.src('./display/**/styling/**/*.less')
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(concat('wod5e-styling.css')) // Concatenate all CSS files into a single file
    .pipe(gulp.dest('./display/')) // Output for the wod-styling.css file
})

// Watch for changes to .less files
gulp.task('watch', function () {
  gulp.watch('./display/**/styling/**/*.less', gulp.series('less'))
})

// Default task
gulp.task('default', gulp.series('less', 'watch'))
