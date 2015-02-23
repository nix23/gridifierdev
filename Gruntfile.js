module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: '\r\n\r\n'
      },
      dist: {
        src: ['js/gridifier/verticalGrid/prepender.js', 'js/gridifier/core/guid.js'],
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
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('build-dev', ['concat']);
  grunt.registerTask('build-prod', ["concat", 'uglify']);
};