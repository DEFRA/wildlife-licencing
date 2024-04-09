'use strict'

/**
 * The gulp build file. Run after install npm
 * It copies the GOV design system assets into the public folder
 * and builds the main.css file from the SASS
 *
 */

import gulp from 'gulp'
import gulpSass from 'gulp-sass'
import s from 'sass'
import sourcemaps from 'gulp-sourcemaps'
import del from 'del'
import minify from 'gulp-minify'
import path from 'path'
import concat from 'gulp-concat'

const sass = gulpSass(s)

const nodeModulesPath = 'node_modules'

const paths = {
  assets: 'assets/',
  public: 'public/',
  govUk: path.join(nodeModulesPath, 'govuk-frontend', 'dist/', 'govuk/'),
  autocompleteAssets: path.join(nodeModulesPath, 'accessible-autocomplete', '/dist/{*.js,*.js.map}')
}

Object.assign(paths, {
  govUkAssets: path.join(paths.govUk, '/assets/{images/**/*.*,fonts/**/*.*}')
})

Object.assign(paths, {
  otherAssets: path.join(paths.assets, '{images/**/*.*,fonts/**/*.*}')
})

console.log(`Building web-service. Paths: ${JSON.stringify(paths, null, 4)}`)

const clean = () => {
  return del(paths.public, { force: true })
}

const copyAssets = () => {
  return gulp.src([paths.govUkAssets, paths.otherAssets])
    .pipe(gulp.dest(paths.public))
}

const copyRobots = () => {
  return gulp.src(`${paths.assets}robots.txt`)
    .pipe(gulp.dest(paths.public))
}

const copyJs = () => {
  return gulp.src([`${paths.govUk}govuk-frontend.min.js`])
    .pipe(concat('govuk-frontend.min.js'))
    .pipe(minify({ noSource: true }))
    .pipe(gulp.dest(`${paths.public}javascript`))
}

const copyAutocompleteJs = () => {
  return gulp.src([paths.autocompleteAssets])
    .pipe(gulp.dest(`${paths.public}javascript`))
}

// Build the sass
const buildSass = () => {
  return gulp.src(`${paths.assets}sass/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed', // 'compressed' or 'expanded' for human-readable
      includePaths: path.join('..', nodeModulesPath)
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${paths.public}stylesheets/`))
}

// The default Gulp task builds the resources
gulp.task('build', gulp.series(
  clean,
  copyAssets,
  copyJs,
  copyAutocompleteJs,
  copyRobots,
  buildSass
))
