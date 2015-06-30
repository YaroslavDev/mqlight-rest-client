var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var mqlight = require('mqlight');
var opts = {
	service: 'amqp://localhost',
	user: 'admin',
	password: 'password'
};

app.post('/events', function(req, res) {
	res.set('Content-Type', 'application/json');
	var outTopic = req.headers.out;
	if (outTopic == undefined) {
		res.send({status: "Error: Specify out topic"});
		return;
	}
	var replyTopics = [];
	addReplyTopic(replyTopics, req.headers.succeeded);
	addReplyTopic(replyTopics, req.headers.failed);

	if (replyTopics.length == 0) {
		res.send({status: "Success: OK"});
	} else {
		var clients = [];
		var callback = function(data, delivery) {
			res.send(data);
			stopClients(clients);
		}
		replyTopics.forEach(function(topic) {
			var client = listen(topic, callback)
			clients.push(client);
		});
	}

	var body = JSON.stringify(req.body);
	sendMessage(outTopic, body);
});

var server = app.listen(3000, function() {});

function addReplyTopic(replyTopics, topic) {
	if (topic != undefined) replyTopics.push(topic);
}

function sendMessage(topic, body) {
	var client = mqlight.createClient(opts);
	client.send(topic, body);
	console.log("Sending " + body + " to topic " + topic);
	console.log("Client stopping after sending message " + client);
	client.stop();
}

function listen(topic, callback) {
	var client = mqlight.createClient(opts);
	client.subscribe(topic);
	console.log("Listening to " + topic);
	client.on('message', callback);
	return client;
}

function stopClients(clients) {
	clients.forEach(function(client) {
		if (client != undefined) {
			console.log("Client stopping after reply " + client);
			client.stop();
		}
	});
}