
/**
 * Handles the db setup - adds the questions to the database if not there already
 * and handles the db connection
 */

var express = require('express'),
	io = require('socket.io'), //socket.io - used for our websocket connection
	socketServer = null,
	client = require('socket.io-client'),
	twitter = require('twitter'), //ntwitter - allows easy JS access to twitter API's - https://github.com/AvianFlu/ntwitter

	pkg = require('../../package.json'),
	SocketController = null,
	FAKE_TWEET = true, //SWITCH TO FALSE ON DAY
	SERVER_BACKOFF_TIME = 5000; //Twitter backoff set to 30 seconds

var TwitterController = {

	t : null,

	globalState : {
		tags : ['hitpainyatta'] // hitpainyatta is the actual event tag
	},

	init : function (app, server, socketController, config) {

		SocketController = socketController;

		TwitterController.t = new twitter(config.twitter);

		_self.openStream();

		return TwitterController;
	},

	openStream : function () {

		if (FAKE_TWEET) {
			var id = 0
			setInterval(function() {
				data = {
					symbol: 'fake symbol',
					time: 'fake time',
					text: 'I absolutely love the new Skylander game – want all the characters now!! #skylanders',
					user : {
						name : 'skylandersTest'
					},
					id: id++
				};
				TwitterController.emitTweet(data);
			}, 2000);

		} else {
			TwitterController.createStream();
		}

	},

	createStream : function () {

		//Tell the twitter API to filter on the watchSymbols
		TwitterController.t.stream('statuses/filter', {
			track: TwitterController.globalState.tags,
			language: 'en'
		}, function(stream) {

			//We have a connection. Now watch the 'data' event for incomming tweets
			//sent from the twitter API hook that we're using
			stream.on('data', TwitterController.emitTweet);

			//catch any errors from the streaming API
			stream.on('error', function(error) {
				console.log("twitter.js :: Stream error :: ", error);

				//try reconnecting to twitter in 30 seconds
				setTimeout(function () {
					TwitterController.openStream();
				}, SERVER_BACKOFF_TIME);

			});
			stream.on('end', function (response) {
				// Handle a disconnection
				console.log("twitter.js :: Stream end – disconnection :: ", response.statusCode);

				//try reconnecting to twitter in 30 seconds
				setTimeout(function () {
					TwitterController.openStream();
				}, SERVER_BACKOFF_TIME);

			});
			stream.on('destroy', function (response) {
				// Handle a 'silent' disconnection from Twitter, no end/error event fired
				console.log("twitter.js :: Stream destroyed :: ", response);

				//try reconnecting to twitter in 30 seconds
				setTimeout(function () {
					TwitterController.openStream();
				}, SERVER_BACKOFF_TIME);
			});
		});

	},

	//this function is called any time we receive some data from the twitter stream
	//we go through the tags, work out which one was mentioned, and then update the GlobalState
	emitTweet : function (data) {

		var tweet;

		//Make sure it was a valid tweet
		if (data.text !== undefined) {

			//setup example of the kind of thing we can extract and send to the UI
			tweet = {
				symbol: null,
				time: null,
				text: data.text,
				name: data.user.name,
				screenName : data.user.screen_name,
				id: data.id
			};

			//emit our tweet to any socket that is listening
			SocketController.emitMsg('tweet', tweet);
		}
	}


};

var _self = TwitterController;

module.exports = TwitterController;