var server;
var _ = require('underscore');

var logger = function(server) {
	var Logger = {

		sockets: {},

		addSocket: function(socket) {
			this.sockets[socket.id] = socket;
		},

		removeSocket: function(socket) {
			delete this.sockets[socket.id];
		},

		init: function() {
			var self = this;
			io.sockets.on('connection', _.bind(this.addSocket, this));
			return this;
		},

		log: function(channel, data) {
			_.each(_.values(this.sockets), function(socket) {
				socket.emit(channel, data);
			});
		},

		sendError: function(e, socket) {
			socket.emit('error', e);
		},

		onError: function(e) {
			_.each(this.getSockets(), _.bind(this.sendError, this, [e]));
		},

		onData: function(channel, data) {
			this.log('data', {channel: channel, data: data.toString()});
		},

		pipe: function(stream, channel) {
			stream.on('error', _.bind(this.onError, this));
			stream.on('data', _.bind(this.onData, this, [channel]));
			stream.resume();
		}
	};

	_.bindAll(Logger);

	io = require('socket.io').listen(server);
	Logger.init();


	internalLogger = Logger;
	return Logger;
};

module.exports = logger;