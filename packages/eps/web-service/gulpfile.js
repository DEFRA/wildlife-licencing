import gulp from 'gulp'
import sassSrc from 'sass'
import gulpSass from 'gulp-sass'
import sourcemaps from 'gulp-sourcemaps'
import concat from 'gulp-concat'
import uglify from 'gulp-uglify'
import del from 'del'
const sass = gulpSass(sassSrc)

const paths = {
  public: 'public/'
}

gulp.task('clean', () => del([paths.public]))

const combineMinifyJs = (files, destination) => {
  return gulp.src(files)
    .pipe(concat(destination))
    .pipe(uglify({ ie8: true }))
    .pipe(gulp.dest('./public/javascripts'))
}

gulp.task('combine-minify-js', () => {
  // All JS files that are required by front end in order
  const files = [
    './node_modules/govuk-frontend/govuk/all.js'
  ]

  return combineMinifyJs(files, 'application.all.min.js')
})

gulp.task('copy-static-assets-orig', () => {
  // copy images and javascript to public
  return gulp
    .src('public/{images/**/*.*,javascripts/**/*.*,stylesheets/**/*.*,data/**/*.*}')
    .pipe(gulp.dest(paths.public))
})

/**
 * Copy all the images supplied from the govuk-frontend
 * project to the public folder so they can be served
 * as static assets by the hapi inert plugin
 */
gulp.task('copy-govuk-frontend-images', () => {
  return gulp
    .src('./node_modules/govuk-frontend/govuk/assets/images/*.*')
    .pipe(gulp.dest(paths.public + '/images'))
})

gulp.task('copy-govuk-frontend-fonts', () => {
  return gulp
    .src('./node_modules/govuk-frontend/govuk/assets/fonts/*.*')
    .pipe(gulp.dest(paths.public + '/fonts'))
})

/**
 * Copies assets from the sources to the public/javascripts folder.
 *
 * These assets are not combined with other scripts to allow some scripts
 * to be used in one page without the application.js having to increase for
 * all pages.
 */
gulp.task('copy-static-javascript', () => {
  return gulp
    .src([
      'node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.js'
    ])
    .pipe(gulp.dest(paths.public + '/javascripts'))
})

/**
 * Copies assets from the sources to the public/stylesheets folder.
 *
 * These assets are not combined with other stylesheets to allow some stylesheets
 * to be used in one page without the application.css having to increase for
 * all pages.
 */
gulp.task('copy-static-styles', () => {
  return gulp
    .src([
      'node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.css'
    ])
    .pipe(gulp.dest(paths.public + '/stylesheets'))
})

gulp.task('copy-static-assets', gulp.series(
  'copy-govuk-frontend-images',
  'copy-govuk-frontend-fonts',
  'copy-static-assets-orig',
  'combine-minify-js',
  'copy-static-javascript',
  'copy-static-styles',
  done => done()
))

// Build the sass-proto
gulp.task('sass', () => {
  return gulp.src('assets/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: [
        'node_modules'
      ]
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.public + 'stylesheets/'))
})

gulp.task('sass:watch', () => {
  return gulp.watch('assets/sass/**/*.scss', gulp.series('sass'))
})

// Build task
gulp.task('build', gulp.series(
  'clean',
  'copy-static-assets',
  'sass',
  done => done()
))

// Default task
gulp.task('default', gulp.series('build'))
