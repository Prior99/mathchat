var port = 7834;

Websocket = {
	openStack : [],
	requests : {},
	responses : {},
	counter : 0,
	connect : function() {
		var self = this;
		this.socket = new WebSocket("ws://" + window.location.hostname + ":" + port + "/");
		this.socket.onopen = function(e) {
			for(var i = 0; i < self.openStack.length; i++) {
				self.openStack[i]();
			}
		};
		this.socket.onmessage = function(e)
		{
			console.log(e.data);
			var obj = JSON.parse(e.data);
			console.log(obj);
			if(obj._type == "Request") {
				if(self.requests[obj._requestID] !== undefined) {
					var answer = self.requests[obj._requestID](obj);
					if(answer === undefined) answer = {};
					answer._responseID = obj._responseID;
					answer._type = "Response";
					self.socket.send(JSON.stringify(answer));
				}
			}
			else if(obj._type == "Response") {
				if(self.responses[obj._responseID] !== undefined) {
					self.responses[obj._responseID](obj);
				}
			}
		}
	},
	addOpenListener : function(listener) {
		this.openStack.push(listener);
	},
	addListener : function(request, listener) {
		this.requests[request] = listener;
	},
	send : function(request, obj, listener) {
		this.responses[this.counter] = listener;
		obj._requestID = request;
		obj._type = "Request";
		obj._responseID = this.counter++;
		obj = JSON.stringify(obj);
		this.socket.send(obj);
	},
	removeListener : function(request) {
		this.requests[request] = undefined;
		console.log("Rmove listener for ");
	}
};

$(function() {
	Websocket.connect();
});
