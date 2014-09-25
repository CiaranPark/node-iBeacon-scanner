module.exports.tasks = {

	/**
	* Watch
	* https://github.com/gruntjs/grunt-contrib-watch
	* Watches your scss, js etc for changes and compiles them
	*/
	watch: {
		scss: {
			files: ['public/scss/**/*.scss', '!public/scss/styleguide.scss'],
			tasks: [
				'sass:kickoff',
				'autoprefixer:kickoff'
			]
		},

		"styleguide_scss": {
			files: ['public/scss/styleguide.scss'],
			tasks: [
				'sass:styleguide',
				'autoprefixer:styleguide'
			]
		},

		js: {
			files: ['<%=config.js.fileList%>', 'Gruntfile.js'],
			tasks: ['uglify']
		},

		livereload: {
			options: { livereload: true },
			files: [
				'public/css/*.css'
			]
		},

		grunticon : {
			files: ['img/src/*.svg', 'img/src/*.png'],
			tasks: [
				'clean:icons',
				'svgmin',
				'grunticon'
			]
		},

		grunt: {
			files: ['_grunt-configs/*.js', 'Gruntfile.js']
		}
	}
};
