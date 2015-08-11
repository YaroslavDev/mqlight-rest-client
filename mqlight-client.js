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
	console.log("Received %s request with headers %j and body %j", req.originalUrl, req.headers, req.body);

	var topic = req.query.topic;
	var replyTopic = req.query.reply;
	var attrs = {};
	if (req.body.attrs) {
		attrs = req.body.attrs;
	}

	var sendCallback = function(err) {
		if (err) {
			res.json(err);
		} else if (replyTopic) {
			mqlight.listenOnce(replyTopic, function(response, delivery) {
				var props = delivery.message.properties;
				console.log("Received amqp message with body %s and delivery %s", JSON.stringify(response, null, 4), JSON.stringify(delivery, null, 4))
                res.set(props);
				console.log("Setting HTTP response %s %j", typeof(response), response);
				res.json(response);
	        });
		} else {
			res.json({status: "Success: OK"});
		}
	};

	if (topic) {
		mqlight.sendMessage(topic, req.body.msg, attrs, sendCallback);
	} else {
		sendCallback(null);
	}
});

app.post('/mock', function(req, res) {
	console.log("Received %s request with body %j", req.originalUrl, req.body);
	mqlight.stopClients(mockerClients);
	mockerClients = mocker.mockServiceFromJSON(req.body);
	res.json({status: "Success: OK"});
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