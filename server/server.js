var port = 7834;

var WebSocketServer = require('ws').Server;
var Websocket = require('./websocket');

var clients = [];
var usernames = [];

(new WebSocketServer({host: '0.0.0.0',port: port})).on('connection', function(ws) {
	ws = new Websocket(ws);
	clients.push(ws);
	ws.addCloseListener(function() {
		clients.splice(clients.indexOf(ws), 1);
		usernames.splice(usernames.indexOf(ws.username), 1);
		for(var i = 0; i < clients.length; i++) {
			var w = clients[i];
			w.send("Disconnect", {
				user : ws.username
			});
		}
	});
	ws.addListener("Username", function(obj) {
		var okay;
		if(ws.username == undefined && obj.username.length >= 3 && obj.username.length <= 12) {
			if(usernames.indexOf(obj.username) == -1) {
				ws.username = obj.username;
				for(var i = 0; i < clients.length; i++) {
					var w = clients[i];
					w.send("Connect", {
						user : obj.username
					});
				}
				usernames.push(obj.username);
				okay = true;
			}
			else {
				okay = false;
			}
		}
		else 
		okay = false;
		return {
			okay: okay
		}
	});
	ws.addListener("Userlist", function() {
		return {
			users: usernames
		};
	});
	ws.addListener("Message", function(obj) {
		if(ws.username === undefined || obj.msg === "") return;
		for(var i = 0; i < clients.length; i++) {
			var w = clients[i];
			w.send("Message", {
				user : ws.username,
				msg : obj.msg
			});
		}
	});
});
