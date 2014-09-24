var TMW = window.TMW || {};

TMW.TwitterPoll = {
	socket : null,
	wallContent : null,


	init : function () {

		this.wallContent = $('#wall-content');

		this.makeSocketConnection();

		this.EventListeners.onPageStart();

	},

	makeSocketConnection : function () {

		log('script.js :: making connection');

		var connectionURL = window.location.hostname;

		this.socket = io.connect(connectionURL);

	},


	setupScreen : function (state) {

		log('script.js :: setupScreen');

		var tags = (state.tags).join(', ');

		//add tags to the screen so we can see what's being tracked
		$('#tags').innerHTML = tags;

		TMW.TwitterPoll.EventListeners.onTweet();

	},

	EventListeners : {
		onPageStart : function () {

			log('script.js :: event :: onPageStart');

			//will receive this event when a connection is made
			TMW.TwitterPoll.socket.on('data', TMW.TwitterPoll.setupScreen);


		},
		onTweet : function () {

			var newListElement;

			//this handles the tweets we receive from our server
			TMW.TwitterPoll.socket.on('tweet', function(tweet) {

				newListElement = document.createElement('p');
				newListElement.innerHTML = tweet.text;
				TMW.TwitterPoll.wallContent.prependChild(newListElement);

				$('#last-update').innerHTML = new Date().toTimeString();

			});

		}
	},

	updateWall : function (tweet) {



	}

};

TMW.TwitterPoll.init();