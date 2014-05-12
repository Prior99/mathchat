function Websocket(ws) {
	this.closeStack = [];
	this.openStack = [];
	this.requests = {};
	this.responses = {};
	this.counter = 0;
	var self = this;
	this.socket = ws;
	this.socket.on('message', function(msg) {
		var obj = JSON.parse(msg);
		if(obj._type == "Request") {
			if(self.requests[obj._requestID] !== undefined) {
				var listener = self.requests[obj._requestID];
				if(!listener.async) {
					var answer = listener.listener(obj);
					if(answer === undefined) answer = {};
					answer._responseID = obj._responseID;
					answer._type = "Response";
					self.socket.send(JSON.stringify(answer));
				}
				else {
					obj.answer = function(ans) {
						if(ans === undefined) ans = {};
						ans._responseID = obj._responseID;
						ans._type = "Response";
						self.socket.send(JSON.stringify(ans));
					};
					listener.listener(obj);
				}
			}
		}
		else if(obj._type == "Response") {
			if(self.responses[obj._responseID] !== undefined) {
				self.responses[obj._responseID](obj);
			}
		}
	});
	this.socket.on('open', function(e) {
		for(var i = 0; i < self.openStack.length; i++) {
			self.openStack[i]();
		}
	});
	this.socket.on('close', function() {
		for(var i = 0; i < self.closeStack.length; i++) {
			self.closeStack[i]();
		}
	});
};

Websocket.prototype = {
	addOpenListener : function(listener) {
		this.openStack.push(listener);
	},
	addCloseListener : function(listener) {
		this.closeStack.push(listener);
	},
	addListener : function(request, listener, asyncAnswer) {
		if(asyncAnswer == undefined) asyncAnswer = false;
		this.requests[request] = {
			listener: listener,
			async: asyncAnswer
		}
	},
	send : function(request, obj, listener) {
		this.responses[this.counter] = listener;
		obj._requestID = request;
		obj._type = "Request";
		obj._responseID = this.counter++;
		obj = JSON.stringify(obj);
		this.socket.send(obj);
	}
};

module.exports = Websocket;
