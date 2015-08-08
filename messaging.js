var mqlight = require('mqlight');

console.log("Reading MQLight configuration...");

try {
	var services = JSON.parse(process.env.VCAP_SERVICES);
	console.log("VCAP_SERVICES: " + JSON.stringify(services));
	var mqlightServiceName = 'mqlight';
	var svc = services[mqlightServiceName][0].credentials;
	console.log("Credentials: " + JSON.stringify(svc));
    service_url = svc.connectionLookupURI;
    service_username = svc.username;
    service_password = svc.password;
} catch(err) {
	service_url = 'amqp://localhost';
	service_username = 'admin';
	service_password = 'password';
}

var opts = {
	service: service_url,
	user: service_username,
	password: service_password
};

console.log("MQLight connection config: " + JSON.stringify(opts));

var counter = 0;

module.exports = {
	sendMessage: function(topic, body, attrs) {
		if (topic != undefined) {
			opts.id = "mrc_client_" + counter;
			counter += 1;
			var options = {properties: attrs};
			var client = mqlight.createClient(opts);
			client.send(topic, body, options);
			console.log("Client %s sent %s to topic %s", client.id, body, topic);
			stopClients([client]);
			return {status: "Success: OK"};
		} else {
			return {status: "Failure: No messages were sent"};
		}
	},
	stopClients: stopClients,
	listen: function(topic, callback) {
		opts.id = "mrc_client_" + counter;
		counter += 1;
		var client = mqlight.createClient(opts);
		client.subscribe(topic);
		client.on('message', callback);
		console.log("Client %s is listening to %s", client.id, topic);
		return client;
	},
	addReplyTopic: function(replyTopics, topic) {
		if (topic != undefined) replyTopics.push(topic);
	},
	readAttributes: function(headers) {
		var attrs = {};
		for (var header in headers) {
			attrs[header] = headers[header];
		}
		return attrs;
	}
};

function stopClients(clients) {
	clients.forEach(function(client) {
		if (client != undefined) {
			console.log("Client %s is being stopped", client.id);
			client.stop();
		}
	});
}