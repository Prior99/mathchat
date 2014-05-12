var port = 7834;

var WebSocketServer = require('ws').Server;
var Websocket = require('./websocket');
var Queue = require('./limited');
var clients = [];
var usernames = [];
var log = new Queue(100);

var ui = 0;

function Client(wsc) {
	var websocket = new Websocket(wsc);
	var username = null;
	this.uj = ui++;
	clients.push(websocket);
	websocket.addCloseListener(function() {
		clients.splice(clients.indexOf(websocket), 1);
		usernames.splice(usernames.indexOf(username), 1);
		for(var i = 0; i < clients.length; i++) {
			var w = clients[i];
			w.send("Disconnect", {
				user : username
			});
		}
	});
	websocket.addListener("Username", function(obj) {
		var okay;
		if(username == null && obj.username.length >= 3 && obj.username.length <= 12) {
			if(usernames.indexOf(obj.username) == -1) {
				username = obj.username;
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
	websocket.addListener("Userlist", function() {
		return {
			users: usernames
		};
	});
	websocket.addListener("Log", function() {
		var arr = [];
		for(var i = 0; i < log.length; i++) {
			arr.push(log.get(i));
		}
		return {
			log : arr
		}
	});
	websocket.addListener("Message", function(obj) {
		if(username === null || obj.msg === undefined || obj.msg.trim() === "") return;
		var date = (new Date()).getTime();
		for(var i = 0; i < clients.length; i++) {
			var w = clients[i];
			w.send("Message", {
				user : username,
				msg : obj.msg,
				time : date
			});
		}
		log.push({
			user: username,
			msg: obj.msg,
			time: date
		});
	});
}

(new WebSocketServer({
	host: '0.0.0.0',
	port: port
})).on('connection', function(ws) {
	new Client(ws);
});
