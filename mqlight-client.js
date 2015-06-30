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
	res.set('Content-Type', 'application/json');
	var outTopic = req.headers.out;
	if (outTopic == undefined) {
		var body = {status: "Error: Specify out topic"};
		res.send(body);
		return;
	}
	var replyTopics = [];
	var succeeded = req.headers.succeeded;
	if (succeeded != undefined) replyTopics.append(succeeded);
	var failed = req.headers.failed;
	if (failed != undefined) replyTopics.append(failed);
	var body = JSON.stringify(req.body);

	if (replyTopics.length == 0) {
		var body = {status: "Success: OK"};
		res.send(body);
	} else {
		var clients = replyTopics.map(function(topic) {
			var client = mqlight.createClient(opts);
			client.subscribe(topic);
			client.on('message', respond);
			return client;
		});
	}

	succeededClient.send(outTopic, body);
});

var server = app.listen(3000, function() {});