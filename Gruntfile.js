module.exports = function(grunt) {
    var banner = "";

    banner += " * Async Responsive HTML Grids\n";
    banner += " * http://gridifier.io\n";
    banner += " * \n";
    banner += " * Gridifier is dual-licensed:\n";
    banner += " *   GPLV3 per non-commercial usage; \n";
    banner += " *   Commercial license per commercial usage.\n";
    banner += " * Read http://gridifier.io/license for details.\n";
    banner += " * Copyright 2015 nTech\n";
    banner += " */\n\n";

    var staticBanner = banner.slice(0);
    staticBanner = "/* Gridifier v1.~.~ source file for custom build.\n" + banner;

    banner = "/* Gridifier v1.0.3\n" + banner;

    var apiFiles = [
        {"/api/": [
            "coordsChanger", "dragifier", "filter", "rotate",
            "slide", "sort", "toggle", "toggleTimeouter"
        ]}
    ];

    var coreFiles = [
        {"/bootstrap/sizesResolver/": ["sizesResolver", "init", "outerWidth", "outerHeight"]},
        {"/bootstrap/": ["event", "prefixer", "dom", "bootstrap"]},
        {"/": ["gridifier"]},
        {"/connections/": ["connections", "connectionsIntersector"]},
        {"/connectors/": [
            "connectors", "connectorsIntersector", "connectorsNormalizer", "connectorsShifter", "transformerConnectors"
        ]},
        {"/core/": [
            "collector", "connectedItemMarker", "disconnector", "eventEmitter", "filtrator", "guid",
            "iterator", "normalizer", "operation", "resorter", "responsiveClassesManager",
            "sizesResolverManager"
        ]},
        {"/discretizer/": ["discretizer", "horizontalCore", "verticalCore", "demonstrator"]},
        {"/dragifier/": ["dragifier", "core", "renderer"]},
        {"/dragifier/connectionIntersection/": ["draggableItem"]},
        {"/dragifier/gridDiscretization/": ["cells", "draggableItem"]},
        {"/errors/": ["apiSettings", "collector", "core", "coreSettings", "error"]},
        {"/grid/": ["grid", "gridSizesUpdater"]},
        {"/horizontalGrid/": ["appender", "itemCoordsExtractor", "prepender", "reversedAppender", "reversedPrepender"]},
        {"/horizontalGrid/connections/": [
            "connections", "connectionsHorizontalIntersector", "connectionsIntersector",
            "connectionsRanges", "connectionsSorter"
        ]},
        {"/horizontalGrid/connectors/": ["connectorsCleaner", "connectorsSelector", "connectorsSorter"]},
        {"/imagesResolver/": ["imagesResolver", "resolvedImage"]},
        {"/operations/": ["append", "prepend", "queue"]},
        {"/renderer/": ["renderer", "rendererConnections", "schedulator", "silentRenderer"]},
        {"/settings/": ["apiSettingsParser", "coreSettingsParser", "settings"]},
        {"/sizesTransformer/": [
            "itemsReappender", "itemsToReappendFinder", "sizesTransformer",
        ]},
        {"/transformerOperations/": ["transform"]},
        {"/verticalGrid/": ["appender", "itemCoordsExtractor", "prepender", "reversedAppender", "reversedPrepender"]},
        {"/verticalGrid/connections/": [
            "connections", "connectionsVerticalIntersector", "connectionsIntersector",
            "connectionsRanges", "connectionsSorter"
        ]},
        {"/verticalGrid/connectors/": ["connectorsCleaner", "connectorsSelector", "connectorsSorter"]}
    ];

    var createConfigPathes = function(configArray, sourceFiles, source, target) {
        for(var i = 0; i < sourceFiles.length; i++) {
            for(var prop in sourceFiles[i]) {
                var dir = prop;
                var files = sourceFiles[i][dir];

                for(var j = 0; j < files.length; j++) {
                    configArray.push({
                        src: [source + dir + files[j] + ".js"], dest: target + dir + files[j] + ".js"
                    });
                }
            }
        }
    }

    var source = "/var/www/gridifierdev/js/gridifier";
    var target = "/var/www/gridifier/src/core";
    var copyCoreSource = source;
    var copyCoreTarget = target;
    var copyCoreConfig = [];

    copyCoreConfig.push({src: [source + "/loader/loaderPrefix.js"], dest: target + "/loader/loaderPrefix.js"});
    createConfigPathes(copyCoreConfig, coreFiles, source, target);
    copyCoreConfig.push({src: [source + "/loader/loaderPostfix.js"], dest: target + "/loader/loaderPostfix.js"});

    var copyApiSource = source;
    var copyApiTarget = "/var/www/gridifier/src";
    var copyApiConfig = [];

    createConfigPathes(copyApiConfig, apiFiles, copyApiSource, copyApiTarget);

    var concatOptions = {
        banner: banner,
        separator: '\r\n\r\n',
        process: function(src, filepath) {
            var fullreg = /\/\*(.*?)@system-log-start(.*?)\*\/([\s\S]*?)\/\*(.*?)@system-log-end(.*?)\*\//g;
            var shortreg = /\/\/(.*?)@system-log-start(.*?)([\s\S]*?)\/\/(.*?)@system-log-end/g;

            return src.replace(fullreg, "").replace(shortreg, "");
        }
    };

    var concatWithStaticBannerOptions = {
        banner: staticBanner
    };
    concatWithStaticBannerOptions.separator = concatOptions.separator;
    concatWithStaticBannerOptions.process = concatOptions.process;

    var createBuildDataSrcPathes = function(buildData, sourceFiles, source) {
        for(var i = 0; i < sourceFiles.length; i++) {
            for(var prop in sourceFiles[i]) {
                var dir = prop;
                var files = sourceFiles[i][dir];

                var skipFiles = false;
                for(var j = 0; j < buildData.exclude.length; j++) {
                    if(dir == buildData.exclude[j]) {
                        skipFiles = true;
                        break;
                    }
                }

                if(skipFiles) continue;

                for(var j = 0; j < files.length; j++) {
                    buildData.src.push(source + dir + files[j] + ".js");
                }
            }
        }
    }

    var buildDataSource = source;
    var buildData = [
        {dest: "/var/www/gridifier/build/gridifier", src: [], exclude: []},
        {dest: "/var/www/gridifier/build/gridifier-vg", src: [], exclude: [
            "/horizontalGrid/", "/horizontalGrid/connections/", "/horizontalGrid/connectors/"
        ]},
        {dest: "/var/www/gridifier/build/gridifier-hg", src: [], exclude: [
            "/verticalGrid/", "/verticalGrid/connections/", "/verticalGrid/connectors/"
        ]}
    ];

    for(var i = 0; i < buildData.length; i++) {
        buildData[i].src.push(buildDataSource + "/loader/loaderPrefix.js");
        createBuildDataSrcPathes(buildData[i], coreFiles, buildDataSource);
        createBuildDataSrcPathes(buildData[i], apiFiles, buildDataSource);
        buildData[i].src.push(buildDataSource + "/loader/loaderPostfix.js");
    }

    var uglifierBuildMinOptions =  {
        banner: banner,
        compress: {
            drop_console: true
        }
    };

    var uglifierBuildOptions = {
        banner: banner,
        compress: false,
        beautify: true
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            buildFull: {
                options: concatOptions,
                files: [{src: buildData[0].src, dest: buildData[0].dest + ".js"}]
            },
            buildVg: {
                options: concatOptions,
                files: [{src: buildData[1].src, dest: buildData[1].dest + ".js"}]
            },
            buildHg: {
                options: concatOptions,
                files: [{src: buildData[2].src, dest: buildData[2].dest + ".js"}]
            },
            buildFullMin: {
                options: concatOptions,
                files: [{src: buildData[0].src, dest: buildData[0].dest + ".min.js"}]
            },
            buildVgMin: {
                options: concatOptions,
                files: [{src: buildData[1].src, dest: buildData[1].dest + ".min.js"}]
            },
            buildHgMin: {
                options: concatOptions,
                files: [{src: buildData[2].src, dest: buildData[2].dest + ".min.js"}]
            },
            copyCore: { options: concatWithStaticBannerOptions, files: copyCoreConfig },
            copyApi: { options: concatWithStaticBannerOptions, files: copyApiConfig }
        },

        uglify: {
            buildFull: {
                options: uglifierBuildOptions,
                files: [{src: buildData[0].dest + ".js", dest: buildData[0].dest + ".js"}]
            },

            buildVg: {
                options: uglifierBuildOptions,
                files: [{src: buildData[1].dest + ".js", dest: buildData[1].dest + ".js"}]
            },

            buildHg: {
                options: uglifierBuildOptions,
                files: [{src: buildData[2].dest + ".js", dest: buildData[2].dest + ".js"}]
            },

            buildFullMin: {
                options: uglifierBuildMinOptions,
                files: [{src: buildData[0].dest + ".min.js", dest: buildData[0].dest + ".min.js"}]
            },

            buildVgMin: {
                options: uglifierBuildMinOptions,
                files: [{src: buildData[1].dest + ".min.js", dest: buildData[1].dest + ".min.js"}]
            },

            buildHgMin: {
                options: uglifierBuildMinOptions,
                files: [{src: buildData[2].dest + ".min.js", dest: buildData[2].dest + ".min.js"}]
            },

            copyCore: {
                options: {
                    banner: staticBanner,
                    compress: false,
                    beautify: true
                },
                files: [{
                    expand: true,
                    cwd: copyCoreTarget,
                    src: ['**/*.js', '!loader/loaderPrefix.js', '!loader/loaderPostfix.js'],
                    dest: copyCoreTarget
                }]
            }
        },

        compress: {
            build: {
                options: {
                    mode: 'gzip'
                },
                files: [{
                    src: ['/var/www/gridifier/build/gridifier.min.js'],
                    dest: '/var/www/gridifier/build/gzip/gridifier.min.gz.js'
                },
                {
                    src: ['/var/www/gridifier/build/gridifier-vg.min.js'],
                    dest: '/var/www/gridifier/build/gzip/gridifier-vg.min.gz.js'
                },
                {
                    src: ['/var/www/gridifier/build/gridifier-hg.min.js'],
                    dest: '/var/www/gridifier/build/gzip/gridifier-hg.min.gz.js'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('default', [
        'concat:copyCore', 'uglify:copyCore', 'concat:copyApi',
        'concat:buildFull', 'concat:buildVg', 'concat:buildHg',
        'uglify:buildFull', 'uglify:buildVg', 'uglify:buildHg',
        'concat:buildFullMin', 'concat:buildVgMin', 'concat:buildHgMin',
        'uglify:buildFullMin', 'uglify:buildVgMin', 'uglify:buildHgMin',
        'compress:build'
    ]);
};