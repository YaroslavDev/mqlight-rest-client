var mqlight = require('mqlight');
var opts = {
	service: 'amqp://localhost',
	user: 'admin',
	password: 'password'
};

var counter = 0;

module.exports = {
	sendMessage: function(topic, body) {
		if (topic != undefined) {
			opts.id = "client" + counter;
			counter += 1;
			var client = mqlight.createClient(opts);
			client.send(topic, body);
			console.log("Sending " + body + " to topic " + topic);
			console.log("Client stopping after sending message " + client);
			client.stop();
			return {status: "Success: OK"};
		} else {
			return {status: "Failure: No messages were sent"};
		}
	},
	listen: function(topic, callback) {
		opts.id = "client" + counter;
		counter += 1;
		var client = mqlight.createClient(opts);
		client.subscribe(topic);
		console.log("Listening to " + topic);
		client.on('message', callback);
		return client;
	},
	stopClients: function(clients) {
		clients.forEach(function(client) {
			if (client != undefined) {
				console.log("Client stopping after reply " + client);
				client.stop();
			}
		});
	},
	addReplyTopic: function(replyTopics, topic) {
		if (topic != undefined) replyTopics.push(topic);
	}
};