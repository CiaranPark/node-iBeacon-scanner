var TMW = window.TMW || {};

TMW.TwitterPoll = {
	socket : null,
	wallContent : null,
	POWER_LEVEL : null,
	ACTIONTYPE : null,
	TWEET : null,
	MODALWINDOW : document.querySelector('.modal'),
	MODALTITLE : document.querySelector('.modal-title'),
	MODALSUBTITLE : document.querySelector('.modal-subtitle'),
	MODALCONTENT : document.querySelector('.modal-content'),
	btnConfirm : document.querySelector('.btn--true'),
	btnCancel : document.querySelector('.btn--false'),
	CURRENTLEVEL : null,
	contentACTIONTYPE : null,

	init : function () {

		this.wallContent = document.querySelector('#wall-content');

		this.makeSocketConnection();

		this.EventListeners.onPageStart();

		this.EventListeners.onPowerChange();

	},

	makeSocketConnection : function () {

		log('script.js :: making connection');

		var connectionURL = window.location.hostname;

		this.socket = io.connect(connectionURL);

	},

	//All our socket events should be initiated in here, so they don’t get scattered about the place too much
	EventListeners : {
		POWER_LEVEL : document.querySelector('.slider'),

		onPageStart : function () {

			log('script.js :: setup event listener :: onPageStart');

			//will receive this event when a connection is made
			TMW.TwitterPoll.socket.on('state', TMW.TwitterPoll.setupScreen);

			TMW.TwitterPoll.setMeter();
			TMW.TwitterPoll.updatePower();

			//Modal confirmation buttons
			TMW.TwitterPoll.btnConfirm.addEventListener('click', function() {
				if ( TMW.TwitterPoll.ACTIONTYPE === 'send' ){
					TMW.TwitterPoll.sendTweet(TMW.TwitterPoll.TWEET);
				}
				addClass(TMW.TwitterPoll.MODALWINDOW, 'is-hidden');
			});

			TMW.TwitterPoll.btnCancel.addEventListener('click', function() {
				addClass(TMW.TwitterPoll.MODALWINDOW, 'is-hidden');
			});

		},

		onTweet : function () {
			//this handles the tweets we receive from our server
			TMW.TwitterPoll.socket.on('tweet', TMW.TwitterPoll.tweetRecieved);
		},

		onSmash : function () {
			// 4@snapshot
			// Global send
			// TODO - need to decide on what user this sends as will be shown on ticker
			TMW.TwitterPoll.socket.emit('tweet-sent', TMW.TwitterPoll.CURRENTLEVEL + '@snapshot');
		},

		onPowerChange : function() {
			this.POWER_LEVEL.addEventListener("change", TMW.TwitterPoll.updatePower, false);
		},

		onSendTweet : function (e, tweet) {

			TMW.TwitterPoll.ACTIONTYPE = 'send';
			TMW.TwitterPoll.TWEET = tweet;
			TMW.TwitterPoll.checkAction('send', tweet);

		},

		onDeleteTweet : function (e, tweet) {
			log(tweet)
			TMW.TwitterPoll.ACTIONTYPE = 'delete';
			TMW.TwitterPoll.TWEET = tweet;
			//TMW.TwitterPoll.checkAction('delete', tweet);
			TMW.TwitterPoll.destroyTweet(TMW.TwitterPoll.TWEET);
		}
	},


	setupScreen : function (state) {

		var tags = (state.tags).join(', ');

		//add tags to the screen so we can see what's being tracked
		//document.querySelector('#tags').innerHTML = tags;

		TMW.TwitterPoll.EventListeners.onTweet();

	},

	// Creates the power meter based on slider range
	setMeter: function () {

		var stepVal = document.querySelector('.slider').getAttribute('max');
		var meter = document.querySelector('.meter');

		for (var i = parseInt(stepVal); i >= 0; i -= 1) {
			var step = document.createElement("li");
			step.className = 'step step-' + [i];
			step.setAttribute('data-index', [i]);
			step.innerHTML = [i];
			meter.appendChild(step);
		}

		var globalBtn = TMW.TwitterPoll.createEl('button', 'SMASH!', 'section--power', 'btn btn--smash');

		globalBtn.addEventListener('click', TMW.TwitterPoll.EventListeners.onSmash);

	},

	// basic element creation
	createEl : function (type, text, target, class){
		var el = document.createElement(type);
		var elTxt = document.createTextNode(text);
		el.className = class;
		el.appendChild(elTxt);

		if (target!=null) {
			var trgt = document.querySelector('.' + target);
			trgt.appendChild(el);
		}

		return el;
	},

	tweetRecieved : function (tweet) {

		var newListElement; //Generate new list element per tweet

		// Column wrappers
		var contentWrap = document.createElement('div');
		var btnWrap = document.createElement('div');
		contentWrap.className = 'tweet-content g-col g-span8';
		btnWrap.className = 'tweet-btns g-col g-span4';

		// Tweet Element
		newListElement = document.createElement('li');
		newListElement.className = "tweet tweet-" + tweet.id;

		// Buttons
		var tweetSendBtn = TMW.TwitterPoll.createEl('button', 'Send', null, 'btn btn--send');
		var tweetDeleteBtn = TMW.TwitterPoll.createEl('button', 'Delete', null, 'btn btn--delete');

		tweetSendBtn.addEventListener('click', function (e) {
			TMW.TwitterPoll.EventListeners.onSendTweet(e, tweet);
		});
		tweetDeleteBtn.addEventListener('click', function (e) {
			TMW.TwitterPoll.EventListeners.onDeleteTweet(e, tweet);
		});

		btnWrap.appendChild(tweetDeleteBtn);
		btnWrap.appendChild(tweetSendBtn);

		// Tweet Title
		var tagName = document.createElement('a');
		tagName.setAttribute('href', 'http://www.twitter.com/'+ tweet.screenName);
		tagName.setAttribute('target', '_new');
		tagName.className = "tweet-title";
		tagName.innerHTML = '@' + tweet.screenName;

		// Tweet content
		var content = document.createElement('p');
		content.className = "content tweet-text"
		content.innerHTML = tweet.text;

		// Appending content
		contentWrap.appendChild(tagName)
		contentWrap.appendChild(content)

		newListElement.appendChild(contentWrap);
		newListElement.appendChild(btnWrap);

		TMW.TwitterPoll.wallContent.appendChild(newListElement);

		document.querySelector('#last-update').innerHTML = new Date().toTimeString();
	},

	// Check if send/delete is OK
	checkAction : function(ACTIONTYPE, tweet) {
		var screenName = tweet.name;

		if ( TMW.TwitterPoll.ACTIONTYPE === 'send' ) {
			TMW.TwitterPoll.MODALTITLE.innerHTML = 'SEND TO BAT?';
			TMW.TwitterPoll.MODALCONTENT.innerHTML = tweet.text;
			removeClass(TMW.TwitterPoll.MODALWINDOW, 'modal--delete');
		} else {
			TMW.TwitterPoll.MODALTITLE.innerHTML = 'REMOVE TWEET?';
			TMW.TwitterPoll.MODALCONTENT.innerHTML = tweet.text;
			addClass(TMW.TwitterPoll.MODALWINDOW, 'modal--delete');
		}

		removeClass(TMW.TwitterPoll.MODALWINDOW, 'is-hidden');
		TMW.TwitterPoll.MODALSUBTITLE.innerHTML = '@' + screenName;
	},

	// Updates the power
	updatePower : function() {
		TMW.TwitterPoll.CURRENTLEVEL = document.querySelector('.slider').value;
		var steps = document.querySelectorAll('.step');

		for (var i = steps.length - 1; i >= 0; i -= 1) {

			var stepVal = steps[i].getAttribute('data-index');

			if (stepVal <= TMW.TwitterPoll.CURRENTLEVEL) {
				addClass(steps[i], 'active');
			} else if (stepVal > TMW.TwitterPoll.CURRENTLEVEL) {
				removeClass(steps[i], 'active');
			}

		};
	},

	//TODO tweet needs to be inactive/toggled??
	destroyTweet : function(tweet) {

		var tweetEl = document.querySelector('.tweet-' + tweet.id);
		addClass(tweetEl, 'inactive');

	},

	// Send tweet data to arduino
	sendTweet : function(tweet) {
		TMW.TwitterPoll.CURRENTLEVEL = document.querySelector('.slider').value;

		var tweetEl = document.querySelector('.tweet-' + tweet.id);
		addClass(tweetEl, 'sent');

		// string format - power@screenName (4@snapshot)
		TMW.TwitterPoll.socket.emit('tweet-sent', TMW.TwitterPoll.CURRENTLEVEL + '@' + tweet.screenName);
	}

};


//  ========================
//  === Prepend function ===
//  ========================

Element.prototype.prependChild = function(child) { this.insertBefore(child, this.firstChild); };

TMW.TwitterPoll.init();