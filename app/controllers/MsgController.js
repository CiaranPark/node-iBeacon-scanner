
/**
 * Handles the db setup - adds the questions to the database if not there already
 * and handles the db connection
 */

var
	//serialport stuff
	com = require("serialport"),
	SerialPort = com.SerialPort,
	sp = null,
	isConnectionOpen = false,
	buffer = '',

	COM_PORT = 'COM15',

	timer = null,
	uiState = null,

	SocketController = null,

	DELAY_ON_FAIL = 400,
	DELAY_ON_COMPLETE = 400,

	pkg = require('../../package.json');


var MsgController = {

	init : function (app, server, socketController, config) {

		console.log('MsgController :: INIT');

		SocketController = socketController;

		//setup our Arduino connection
		//commented out for testing purposes

		_self.Arduino.setupConnection();

		return _self;

	},

	sendMessage : function (to, msg) {

		console.log('sendMessage :: sending Message', msg);

		if (to === 'server') {

			_self.Arduino.writeOutput(msg);

		}

	},

	Arduino : {

		setupConnection : function () {

			//connect to the arduino through it’s path
			//sp = new SerialPort("/dev/tty.usbserial-A92HH373", {

			sp = new SerialPort(COM_PORT, {
					baudrate: 9600,
					parser: require("serialport").parsers.readline('\r\n')
			});

			//wait for our connection to open up
			sp.on('open', function (e) {
				if (e) {
					console.log('failed to open : '+ e);
				} else {
					_self.Arduino.onSerialOpen();
				}
			});

		},

		//takes a string and writes it to the arduino
		writeOutput : function (data) {

			sp.write(data.replace(/\s/, ''), function (error) {
				if (error !== undefined) {
					console.log(error);
				}
			});

		},

		onSerialOpen : function () {

			console.log('arduino : connection opened');
			//now our connection is open, we can read/write as much as we want, so set the state to reflect this
			isConnectionOpen = true;

			//setup the receiver for any data coming through from the arduino
			sp.on('data', _self.Arduino.onDataReceived);

		},

		onDataReceived : function (data) {

			var dataString = data.toString();

			console.log(data);

			switch (dataString) {
				case 'TWEET':
					_self.sendMessage('server', 'notready');
					break;
			}

		}
	},


	//this handles all of our UI connections detected through our socketServer
	//newConnection gets called on every new connection and sets up events for that socket
	UI : {

		newConnection : function (socket) {

			_self.UI.initCustomEvents(socket);

			uiState = 'connected';
			SocketController.emitMsg('connectSuccess');
		},

		initCustomEvents : function (socket) {
			socket.on('tweet-sent', _self.UI.tweetSendHandler);
		},

		tweetSendHandler : function (data) {
			_self.sendMessage('server', data);
		},

		userLoginHandler : function () {
			console.log('ui : user is ready');

			//see if the arduino is in a ready state
			_self.UI.sendStartSignal();

			//ui is in a loading state while it waits for the arduino to respond that it is ready
			uiState = 'loading';
		},

		userRetryHandler : function () {

			uiState = 'connected';

			_self.UI.userLoginHandler();
		},

		userResetHandler : function () {

			uiState = 'connected';

			socketServer.emitMsg('changeView', { view : 'initial' });
		},

		receiveMsg : function (msg) {

			console.log('ui : message received : ' + msg);

			//dependent on msg, fire different responses
			switch (msg) {
				case 'tweet-sent':
					_self.sendMessage('server', msg);
					break;
				case 'notready':
					_self.UI.sendStartSignal(500);
					break;
				case 'ready':
					socketServer.emitMsg('changeView', { view : 'inPlay' });
					break;
				case 'fail':
					setTimeout(function () {
						socketServer.emitMsg('capture', { state : 'fail' });
					}, DELAY_ON_FAIL);
					break;
				case 'complete':
					setTimeout(function () {
						socketServer.emitMsg('capture', { state : 'complete' });
					}, DELAY_ON_COMPLETE);
					break;
			}

		},

		sendStartSignal : function (delay) {

			console.log('sendStartSignal');

			delay = (delay !== null ? delay : 0);

			//writes 0 to the server to see if its ready
			//waits x milliseconds if delay is set
			timer = setTimeout(function () {
				_self.sendMessage('server', '0');
			}, delay);

			if (uiState === 'connected') {
				SocketController.emitMsg('changeView', { view : 'loader' });
			}

		}
	}
};

var _self = MsgController;

module.exports = MsgController;


