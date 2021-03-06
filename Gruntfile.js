module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy'); 
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-browserify');
  
  var config = {
    properties: {
      buildDir: './build',
      distDir: './dist',
      libDir: './lib',
      devDir: './dev',
      devServerDir: '<%= properties.buildDir %>/dev'
    },
    clean: {
      build: ['<%= properties.buildDir %>'],
      dist: ['<%= properties.distDir %>']
    },
    
    browserify: {
      p: {
        files: {
          '<%= properties.buildDir %>/p.js': '<%= properties.libDir %>/init.js'
        }
      }
    },

    copy: {
      pDev:{
        files: [{
            dest: '<%= properties.devServerDir %>/p.js',
            src: '<%= properties.buildDir %>/p.js'
        },{
            dest: '<%= properties.devServerDir %>',
            src: 'examples/**',
            expand: true
        }
        ]
      }
    },

    uglify: {
      p: {
        files: {
          'dist/p.js': ['<%= properties.buildDir %>/p.js']
        }
      }
    },

    watch: {
      p: {
        files: ['<%= properties.libDir %>/**', 'examples/**'],
        tasks: ["browserify:p", "copy:pDev"]
      }
    },

    connect: {
      p: {
        options: {
          hostname: "*",
          port:20501,
          base: './build/dev'
        }
      }
    },

    jshint: {
      p: ['./lib/**/*.js'],
      options: {
        camelcase: true,
        strict: false,
        trailing: false,
        curly: false,
        eqeqeq: false,
        immed: true,
        latedef: false,
        newcap: true,
        noarg: true,
        sub: true,
        evil:true,
        undef: true,
        boss: true,
        eqnull: true,
        smarttabs: true,
        browser:true,
        es5: true,
        globals: {
          module: true,
          exports: true,
          require: true,
          RTCIceCandidate: true,
          RTCSessionDescription: true,
          webkitRTCPeerConnection: true
        }
      }
    },

    jasmine: {
      test: {
        src: '<%= properties.buildDir %>/p.js',
        options: {
          keepRunner: true,
          specs: 'test/specs/*.js',
          helpers: ['node_modules/sinon/pkg/sinon.js', 'test/helpers/*.js']
        }
      }
    }
  };

  grunt.registerTask('default', 'release');

  grunt.registerTask('test', [
    'browserify:p',
    'jasmine'
  ]);

  grunt.registerTask('dev', [
    'browserify:p', 
    'copy:pDev', 
    'connect', 
    'watch'
  ]);


  grunt.registerTask('release', [
    'jshint:p',
    'browserify:p', 
    'uglify:p'
  ]);

  grunt.initConfig(config);
};
