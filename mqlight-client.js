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
app.post('/event', function(req, res) {
	function respond(data, delivery) {
		res.send(data);
		failedClient.unsubscribe(failedTopic);
		succeededClient.unsubscribe(succeededTopic);
	}
	res.set('Content-Type', 'application/json');
	var outTopic = req.headers.out;
	var succeededTopic = req.headers.succeeded;
	var failedTopic = req.headers.failed;
	var body = JSON.stringify(req.body);

	//opts["id"] = "failedClient";
	var failedClient = mqlight.createClient(opts);
	failedClient.subscribe(failedTopic);
	failedClient.on('message', respond);

	//opts["id"] = "succeededClient";
	var succeededClient = mqlight.createClient(opts);
	succeededClient.subscribe(succeededTopic);
	succeededClient.on('message', respond);

	succeededClient.send(outTopic, body);
});

var server = app.listen(3000, function() {});