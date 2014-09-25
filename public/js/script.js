var TMW = window.TMW || {};

TMW.TwitterPoll = {
	socket : null,
	wallContent : null,


	init : function () {

		this.wallContent = document.querySelector('#wall-content');

		this.makeSocketConnection();

		this.EventListeners.onPageStart();

	},

	makeSocketConnection : function () {

		log('script.js :: making connection');

		var connectionURL = window.location.hostname;

		this.socket = io.connect(connectionURL);

	},


	//All our socket events should be initiated in here, so they don’t get scattered about the place too much
	EventListeners : {
		onPageStart : function () {

			log('script.js :: setup event listener :: onPageStart');

			//will receive this event when a connection is made
			TMW.TwitterPoll.socket.on('state', TMW.TwitterPoll.setupScreen);


		},
		onTweet : function () {

			log('script.js :: setup event listener :: onTweet');

			//this handles the tweets we receive from our server
			TMW.TwitterPoll.socket.on('tweet', TMW.TwitterPoll.tweetRecieved);

		}
	},


	setupScreen : function (state) {

		log('script.js :: setupScreen');

		var tags = (state.tags).join(', ');

		//add tags to the screen so we can see what's being tracked
		$('#tags').innerHTML = tags;

		TMW.TwitterPoll.EventListeners.onTweet();

	},

	tweetRecieved : function (tweet) {

		var newListElement;

		newListElement = document.createElement('p');
		newListElement.innerHTML = tweet.text;
		TMW.TwitterPoll.wallContent.prependChild(newListElement);

		$('#last-update').innerHTML = new Date().toTimeString();

	}

};

TMW.TwitterPoll.init();