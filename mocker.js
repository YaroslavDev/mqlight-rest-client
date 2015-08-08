var fs = require('fs');
var underscore = require('underscore');
var mqlight = require('./messaging');

module.exports = {
	mockServiceFromFile: function(filename) {
		fs.readFile(filename, 'utf8', function(err, data) {
			if (err) {
				console.log(err);
			}
		});
		var mockRules = JSON.parse(data);
		return mockServiceFromJSON(mockRules);
	},
	mockServiceFromJSON: function(mockRules) {
		console.log("MOCKER: Mocking service according to rules: %s", JSON.stringify(mockRules, null, 4));
		return mockRules.rules.map(function(rule) {
			var callback = function(data, delivery) {
				var msg = JSON.parse(data);
				var attrs = delivery.message.properties;
				console.log("MOCKER: Received msg %s", JSON.stringify(msg, null, 4));
				console.log("MOCKER: Received msg with attrs %s", JSON.stringify(delivery, null, 4));
				if (underscore.isEqual(msg, rule.recv)) {
					var sendTopic = rule.to;
					sendTopic = appendAttribute(sendTopic, attrs, "x-vcap-request-id");//x-vcap-request-id or reply-id
					sendTopic = appendAttribute(sendTopic, attrs, "provider");
					var sendAttrs = mqlight.readAttributes(attrs);
					var body = JSON.stringify(rule.send);
					mqlight.sendMessage(sendTopic, body, sendAttrs);
				} else {
					console.log(data);
					console.log(rule.recv);
					console.log("MOCKER: Different message arrived to expected topic!");
				}
			};
			return mqlight.listen(rule.on, callback);
		});
	}
}

function appendAttribute(topic, attrs, key) {
	var attr = attrs[key];
	if (attr != undefined) {
		topic += "/" + attr;
	}
	return topic;
}