var http = require('http');
var express = require('express');
var httpOpts = {};
httpOpts.port = (process.env.VCAP_APP_PORT || 3000);
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var mqlight = require('./messaging');

var mocker = require('./mocker');
var mockerClients = [];
var ruleFile = process.argv[2];
if (ruleFile != undefined) {
	mockerClients = mocker.mockServiceFromFile(ruleFile);
}

app.post('/events', function(req, res) {
	console.log("Received %s request with body %j", req.originalUrl, req.body);
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
			var response = JSON.parse(data);
			console.log("Setting HTTP response %s %j", typeof(response), response);
			res.json(response);
			mqlight.stopClients(clients);
        };
		replyTopics.forEach(function(topic) {
			var client = mqlight.listen(topic, callback);
			clients.push(client);
		});
	} else {
		res.send(response);
	}
});

app.post('/mock', function(req, res) {
	console.log("Received %s request with body %j", req.originalUrl, req.body);
	res.set('Content-Type', 'application/json');
	mqlight.stopClients(mockerClients);
	mockerClients = mocker.mockServiceFromJSON(req.body);
	res.send({status: "Success: OK"});
});

/*
 * Start REST server
 */
if (httpOpts.host) {
  http.createServer(app).listen(httpOpts.host, httpOpts.port, function () {
    console.log('App listening on %s:%s', httpOpts.host, httpOpts.port);
  });
}
else {
  http.createServer(app).listen(httpOpts.port, function () {
    console.log('App listening on *:%s', httpOpts.port);
  });
}