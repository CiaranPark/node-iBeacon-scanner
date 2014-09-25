
/**
 * Handles the db setup - adds the questions to the database if not there already
 * and handles the db connection
 */

var express = require('express'),
	io = require('socket.io'), //socket.io - used for our websocket connection
	client = require('socket.io-client'),
	twitter = require('twitter'), //ntwitter - allows easy JS access to twitter API's - https://github.com/AvianFlu/ntwitter

	pkg = require('../package.json'),
	FAKE_TWEET = true,
	SERVER_BACKOFF_TIME = 30000; //Twitter backoff set to 30 seconds


module.exports = function (app, server, config) {

	//Start a Socket.IO listen
	var socketServer = io.listen(server);
	socketServer.set('log level', 1); //don't log all emits etc


	//  ==================
	//  === ON CONNECT ===
	//  ==================

	//If a client connects, give them the current data that the server has tracked
	//so here that would be how many tweets of each type we have stored
	socketServer.sockets.on('connection', function(socket) {
		console.log('twitter.js :: New connection');

		// emits our global state under
		socketServer.sockets.emit('state', t.globalState);
	});

	//  ============================
	//  === SERVER ERROR LOGGING ===
	//  ============================

	socketServer.sockets.on('close', function(socket) {
		console.log('twitter.js :: socketServer has closed');
	});




	//  ====================================
	//  === TWITTER CONNECTION TO STREAM ===
	//  ====================================

	//Instantiate the twitter component
	var t = new twitter(config.twitter);

	//  =============================
	//  === State related object  ===
	//  =============================
	//
	//  Store anything related to global state here
	//
	t.globalState = {
		tags : ['dogs', 'cats']
	}

	t.openStream = function () {

		if (FAKE_TWEET) {
			setInterval(function() {
				data = {
					text : 'fake tweet'
				};
				t.emitTweet(data);
			}, 1000);

		} else {
			t.createStream();
		}

	};

	t.createStream = function () {

		//Tell the twitter API to filter on the watchSymbols
		t.stream('statuses/filter', {
			track: t.globalState.tags,
			language: 'en'
		}, function(stream) {

			//We have a connection. Now watch the 'data' event for incomming tweets
			//sent from the twitter API hook that we're using
			stream.on('data', t.emitTweet);

			//catch any errors from the streaming API
			stream.on('error', function(error) {
				console.log("twitter.js :: Stream error :: ", error);

				//try reconnecting to twitter in 30 seconds
				setTimeout(function () {
					t.openStream();
				}, SERVER_BACKOFF_TIME);

			});
			stream.on('end', function (response) {
				// Handle a disconnection
				console.log("twitter.js :: Stream end – disconnection :: ", response.statusCode);

				//try reconnecting to twitter in 30 seconds
				setTimeout(function () {
					t.openStream();
				}, SERVER_BACKOFF_TIME);

			});
			stream.on('destroy', function (response) {
				// Handle a 'silent' disconnection from Twitter, no end/error event fired
				console.log("twitter.js :: Stream destroyed :: ", response);

				//try reconnecting to twitter in 30 seconds
				setTimeout(function () {
					t.openStream();
				}, SERVER_BACKOFF_TIME);
			});
		});

	};

	//this function is called any time we receive some data from the twitter stream
	//we go through the tags, work out which one was mentioned, and then update the GlobalState
	t.emitTweet = function (data) {
		console.log('twitter.js :: emitTweet');

		var tweet;

		//Make sure it was a valid tweet
		if (data.text !== undefined) {

			//setup example of the kind of thing we can extract and send to the UI
			tweet = {
				symbol: null,
				time: null,
				text: data.text,
				country: ''
			};

			//emit our tweet to any socket that is listening
			socketServer.sockets.emit('tweet', tweet);
		}
	};

	t.openStream();

	return t;
};