module.exports = function(config) {
    config.set({
        basePath: '..',
        frameworks: ['mocha', 'chai'],
        browsers: ['Chrome'],
        /* files are set in gulp config file
        files: [
            'public/javascripts/zepto.js',
            'public/javascripts/*.js',
            'public/javascripts/models/*.js',
            'test/*.js'
        ],
        */
        proxies: {
            '/templates': 'http://localhost:3000/templates'
        },
        excludes: [
            'test/karma.conf.js'
        ]
    });
};