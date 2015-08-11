var fs = require('fs');
var underscore = require('underscore');
var mqlight = require('./messaging');

module.exports = {
	mockServiceFromFile: function(filename) {
		var data = fs.readFileSync(filename).toString();
		var mockRules = JSON.parse(data);
		return mockServiceFromJSON(mockRules);
	},
	mockServiceFromJSON: mockServiceFromJSON
};

function appendAttribute(topic, attrs, key) {
    if (attrs) {
        var attr = attrs[key];
        if (attr != undefined) {
            topic += "/" + attr;
        }
    }
	return topic;
}

function mockServiceFromJSON(mockRules) {
	console.log("MOCKER: Mocking service according to rules: %s", JSON.stringify(mockRules, null, 4));
	return mockRules.rules.map(function(rule) {
		return mqlight.listen(rule.on, function(msg, delivery) {
			var attrs = delivery.message.properties;
			console.log("MOCKER: Received msg %s", JSON.stringify(msg, null, 4));
			console.log("MOCKER: Received msg with attrs %s", JSON.stringify(delivery, null, 4));
			if (underscore.isEqual(msg, rule.recv)) {
				var sendTopic = rule.to;
				sendTopic = appendAttribute(sendTopic, attrs, "x-vcap-request-id");//x-vcap-request-id or reply-id
				sendTopic = appendAttribute(sendTopic, attrs, "provider");
				var sendAttrs = mqlight.readAttributes(attrs);
				console.log("MOCKER: Corresponding rule %j", rule.send);
				mqlight.sendMessage(sendTopic, rule.send, sendAttrs);
			} else {
				console.log(data);
				console.log(rule.recv);
				console.log("MOCKER: Different message arrived to expected topic!");
			}
		});
	});
}