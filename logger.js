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

		onData: function(source, data) {
			this.log('data', {source: source, data: data.toString()});
		},

		pipe: function(stream, source) {
			stream.on('error', _.bind(this.onError, this));
			stream.on('data', _.bind(this.onData, this, [source]));
			stream.resume();
		}
	};

	_.bindAll(Logger);

	if(undefined !== server.sockets) {
		io = server;
	} else {
		io = require('socket.io').listen(server);
	}

	return Logger.init();
};

module.exports = logger;