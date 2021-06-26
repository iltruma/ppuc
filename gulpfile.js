//Import dipendenze
const browserSync  = require('browser-sync').create();
const gulp         = require('gulp');
const run          = require('gulp-run-command').default;
const imagemin     = require('gulp-imagemin');
const cache        = require('gulp-cache');
const size         = require('gulp-size');
const runSequence  = require('gulp4-run-sequence');


// Lista delle path necesarie ai tasks
const paths = {
  here: './',
  _site: {
    root: '_site',
    assets: {
      root: '_site/assets',
      img: '_site/assets/img',
    }
  },
  _posts: {
    root: '_posts'
  },
  assets: {
    root: 'assets',
    img: {
      root: 'assets/img',
      all: ['assets/img/**/*', '!assets/img/**/*.svg'],
      svg: 'assets/img/**/*.svg'
    },
    html: {
      root: ['_layouts', '_includes'],
      all: ['_layouts/**/*.html', '_includes/**/*.html']
    }
  }
};

// Task che cancella la cartella _site
gulp.task('clean:jekyll', function(callback) {
  run('jekyll clean')();
  callback();
});


// Task di ottimizzazione delle immagini (sovrascrittura)
gulp.task('build:images', function() {
  return gulp.src(paths.assets.img.all)
  .pipe(cache(imagemin({ optimizationLevel:5, progressive: true, interlaced: true })))
  .pipe(browserSync.reload({stream: true}))
  .pipe(size())
  .pipe(gulp.dest(paths._site.assets.img))
  .pipe(gulp.dest(paths.assets.img.root));
});

// Task per il build Jekyll. Crea la cartella _site
gulp.task('build:jekyll', function(callback) {
  run('jekyll build --config _config.yml --future --trace')();
  callback();
});

// Task watch per far ricompilare i file in _site
gulp.task('build:jekyll:watch', gulp.series('build:jekyll', function(callback) {
  browserSync.reload({stream: true});
  callback();
}));

// Build task completo (assets + jekyll)
gulp.task('build', function(callback) {runSequence('build:jekyll', callback)});

// Task che fa il build e fa partire browsersync
gulp.task('serve', gulp.series('build', function(callback) {
  browserSync.init({
    server: {
      baseDir: paths._site.root
    },
    ui: {
      port: 3000
    },
    ghostMode: false, // Toggle to mirror clicks, reloads etc (performance)
    logFileChanges: true,
    open: true       // Toggle to auto-open page when starting
  });
  //Watch _config.yml
  gulp.watch(['_config.yml'], gulp.series('build:jekyll:watch'));
  // Watch image files and pipe changes to browserSync
  gulp.watch(paths.assets.img.all, gulp.series('build:images'));
  //Watch html
  gulp.watch(paths.assets.html.all, gulp.series('build:jekyll:watch'));
  // Watch posts
  gulp.watch(paths._posts.root + '**/*.+(md|markdown|MD)', gulp.series('build:jekyll:watch'));
  // Watch data files
  //gulp.watch('_data/**.*+(yml|yaml|csv|json)', ['build:jekyll:watch']);
  callback();
}));
