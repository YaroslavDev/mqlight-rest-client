var http = require('http');
var express = require('express');
var httpOpts = {};
httpOpts.port = (process.env.VCAP_APP_PORT || 3000);
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var mqlight = require('./messaging');

var mocker = require('./mocker');
var ruleFile = process.argv[2];
if (ruleFile != undefined) {
	mocker.mockServiceFromFile(ruleFile);
}

app.post('/events', function(req, res) {
	res.set('Content-Type', 'application/json');

	var body = JSON.stringify(req.body);
	var topic = req.query.topic;
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

/*
 * Start REST server
 */
if (httpOpts.host) {
  http.createServer(app).listen(httpOpts.host, httpOpts.port, function () {
    console.log('App listening on ' + httpOpts.host + ':' + httpOpts.port);
  });
}
else {
  http.createServer(app).listen(httpOpts.port, function () {
    console.log('App listening on *:' + httpOpts.port);
  });
}