module.exports = function(grunt) {
  var test = "/var/www/gridifier";

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: '\r\n\r\n'
      },

      core: {
         files: [{
            dest: test + '/src/core/sizesTransformer/sizesTransformer.js',
            src: ['js/gridifier/sizesTransformer/sizesTransformer.js']
         }
         ]
      },

      dist: {
        src: [
          'js/gridifier/loader/loaderPrefix.js',

          /* Bootstrap */
          'js/gridifier/bootstrap/sizesResolver/sizesResolver.js',
          'js/gridifier/bootstrap/sizesResolver/init.js',
          'js/gridifier/bootstrap/sizesResolver/outerWidth.js',
          'js/gridifier/bootstrap/sizesResolver/outerHeight.js',
          'js/gridifier/bootstrap/event.js',
          'js/gridifier/bootstrap/prefixer.js',
          'js/gridifier/bootstrap/dom.js',
          'js/gridifier/bootstrap/bootstrap.js',

          /* Core */
          'js/gridifier/gridifier.js',
          'js/gridifier/api/**/*.js',
          'js/gridifier/connections/**/*.js',
          'js/gridifier/connectors/**/*.js',
          'js/gridifier/core/**/*.js',
          
          'js/gridifier/discretizer/discretizer.js',
          'js/gridifier/discretizer/horizontalCore.js',
          'js/gridifier/discretizer/verticalCore.js',
          'js/gridifier/discretizer/demonstrator.js',

          'js/gridifier/dragifier/dragifier.js',
          'js/gridifier/dragifier/core.js',
          'js/gridifier/dragifier/renderer.js',
          'js/gridifier/dragifier/connectionIntersection/draggableItem.js',
          'js/gridifier/dragifier/gridDiscretization/cells.js',
          'js/gridifier/dragifier/gridDiscretization/draggableItem.js',

          'js/gridifier/errors/**/*.js',
          'js/gridifier/grid/**/*.js',
          'js/gridifier/horizontalGrid/**/*.js',
          'js/gridifier/operations/**/*.js',
          
          'js/gridifier/renderer/renderer.js',
          'js/gridifier/renderer/rendererConnections.js',
          'js/gridifier/renderer/schedulator.js',
          'js/gridifier/renderer/silentRenderer.js',

          'js/gridifier/settings/**/*.js',
          'js/gridifier/sizesTransformer/**/*.js',
          'js/gridifier/transformerOperations/**/*.js',
          'js/gridifier/verticalGrid/**/*.js',

          'js/gridifier/loader/loaderPostfix.js'
        ],
        dest: 'build/gridifier.js'
      }
    },

    strip_code: {
      options: {
        start_comment: '@system-log-start',
        end_comment: '@system-log-end'
      },
      dist: {
        src: 'build/gridifier.js',
        dest: 'build/gridifier.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        compress: false
      },
      dist: {
        files: {
          'build/gridifier.min.js': ['<%= concat.dist.dest %>']
        }
      },

      core: {
        options: {
            beautify: true
        },
        files: [{
            //'/var/www/gridifier/src/core/sizesTransformer/sizesTransformer.js': ['/var/www/gridifier/src/core/sizesTransformer/sizesTransformer.js']
            expand: true,
            cwd: '/var/www/gridifier/src',
            src: '**/*.js',
            dest: '/var/www/gridifier/src'
        }]
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-strip-code');

  // Default task(s).
  grunt.registerTask('build-dev-with-logs', ['concat']);
  grunt.registerTask('build-dev', ['concat', 'strip_code']);
  grunt.registerTask('build-prod', ['concat', 'strip_code', 'uglify']);

  grunt.registerTask('build-core', ['concat:core', 'uglify:core']);
};