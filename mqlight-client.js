var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var mqlight = require('./messaging');

app.post('/events', function(req, res) {
	res.set('Content-Type', 'application/json');

	var body = JSON.stringify(req.body);
	var topic = req.query.topic;
	console.log("SENDING" + topic);
	var attrs = mqlight.readAttributes(req.headers);
	var response = mqlight.sendMessage(topic, body, attrs);

	var replyTopics = [];
	mqlight.addReplyTopic(replyTopics, req.query.succeeded);
	mqlight.addReplyTopic(replyTopics, req.query.failed);

	if (replyTopics.length != 0) {
		var clients = [];
		var callback = function(data, delivery) {
			var props = delivery.message.properties;
			for (attr in props) {
				res.set(attr, props[attr]);
			};
			res.send(data);
			mqlight.stopClients(clients);
		}
		replyTopics.forEach(function(topic) {
			var client = mqlight.listen(topic, callback)
			clients.push(client);
		});
	} else {
		res.send(response);
	}
});

var server = app.listen(3000, function() {});
