var TMW = window.TMW || {};

TMW.TwitterPoll = {
	socket : null,
	wallContent : null,



	init : function () {

		this.wallContent = document.querySelector('#wall-content');

		this.makeSocketConnection();

		this.EventListeners.onPageStart();

		this.EventListeners.onPowerChange();

		this.EventListeners.onApproveTweet();

	},

	makeSocketConnection : function () {

		log('script.js :: making connection');

		var connectionURL = window.location.hostname;

		this.socket = io.connect(connectionURL);

	},


	//All our socket events should be initiated in here, so they don’t get scattered about the place too much
	EventListeners : {
		POWER_LEVEL : document.querySelector('.power'),

		onPageStart : function () {

			log('script.js :: setup event listener :: onPageStart');

			//will receive this event when a connection is made
			TMW.TwitterPoll.socket.on('state', TMW.TwitterPoll.setupScreen);

			TMW.TwitterPoll.updatePower();

		},

		onTweet : function () {

			log('script.js :: setup event listener :: onTweet');

			//this handles the tweets we receive from our server
			TMW.TwitterPoll.socket.on('tweet', TMW.TwitterPoll.tweetRecieved);

		},

		onPowerChange : function() {
			log('power change listening')

			this.POWER_LEVEL.addEventListener("change", TMW.TwitterPoll.updatePower, false);
		},

		onApproveTweet : function(el) {
			//tweets.addEventListener('click', function(e) {

				//log(this, e);

			//})
		}
	},


	setupScreen : function (state) {

		log('script.js :: setupScreen');

		var tags = (state.tags).join(', ');

		//add tags to the screen so we can see what's being tracked
		//document.querySelector('#tags').innerHTML = tags;

		TMW.TwitterPoll.EventListeners.onTweet();

	},

	tweetRecieved : function (tweet) {

		log('tweet added');

		var newListElement;
		var tweetEl = tweet.text + "<button class='btn--tweet' value='Send to Bat'>Send to Bat</button>";
		//log('Tweet recieved');

		newListElement = document.createElement('li');
		newListElement.innerHTML = tweetEl;
		TMW.TwitterPoll.wallContent.prependChild(newListElement);

		newListElement.addEventListener('click', function() {
			log('added to list');
			TMW.TwitterPoll.destroyTweet(this.parentNode);
		});

		document.querySelector('#last-update').innerHTML = new Date().toTimeString();

	},

	updatePower : function() {

		var powerLevel = document.querySelector('.current-Power');
		powerLevel.innerHTML = document.querySelector('.power').value;

	},

	//TODO tweet needs to be inactive/toggled??
	destroyTweet : function(el) {
		el.className = " inactive";
	}

};


//  ========================
//  === Prepend function ===
//  ========================

Element.prototype.prependChild = function(child) { this.insertBefore(child, this.firstChild); };

TMW.TwitterPoll.init();