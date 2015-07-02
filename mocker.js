var fs = require('fs');
var underscore = require('underscore');
var mqlight = require('./messaging');

module.exports = {
	mockServiceFromFile: function(filename) {
		fs.readFile(filename, 'utf8', function(err, data) {
			if (err) {
				console.log(err);
			}
			var mockRules = JSON.parse(data);
			mockRules.rules.forEach(function(rule) {
				var callback = function(data, delivery) {
					var msg = JSON.parse(data);
					var attrs = delivery.message.properties;
					if (underscore.isEqual(msg, rule.recv)) {
						var sendTopic = rule.to;
						sendTopic = appendAttribute(sendTopic, attrs, "x-vcap-request-id");
						sendTopic = appendAttribute(sendTopic, attrs, "provider");
						var sendAttrs = mqlight.readAttributes(attrs);
						mqlight.sendMessage(sendTopic, rule.send, sendAttrs);
					} else {
						console.log(data);
						console.log(rule.recv);
						console.log("OBJECT NOT EQUAL!");
					}
				};
				mqlight.listen(rule.on, callback);
			});
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