var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

var mqlight = require('mqlight');
var opts = {
	service: 'amqp://localhost',
	user: 'admin',
	password: 'password'
};
app.post('/events', function(req, res) {
	function respond(data, delivery) {
		res.send(data);
		clients.forEach(function(client) {
			client.stop();
		});
	}
	function listen(topic) {
		var client = mqlight.createClient(opts);
		client.subscribe(topic);
		console.log("Listening to " + topic);
		client.on('message', respond);
		return client;
	}
	function addReplyTopic(topic) {
		if (topic != undefined) replyTopics.push(topic);
	}
	function send(topic, body) {
		var client = mqlight.createClient(opts);
		client.send(topic, body);
		console.log("Sending " + body + " to topic " + topic);
		client.stop();
	}
	res.set('Content-Type', 'application/json');
	var outTopic = req.headers.out;
	if (outTopic == undefined) {
		res.send({status: "Error: Specify out topic"});
		return;
	}
	var replyTopics = [];
	addReplyTopic(req.headers.succeeded);
	addReplyTopic(req.headers.failed);

	if (replyTopics.length == 0) {
		res.send({status: "Success: OK"});
	} else {
		var clients = replyTopics.map(listen);
	}

	var body = JSON.stringify(req.body);
	send(outTopic, body);
});

var server = app.listen(3000, function() {});