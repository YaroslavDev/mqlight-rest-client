var mqlight = require('mqlight');
var mqutils = require('./mqutils');

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

var connectionConfig = {
	service: service_url,
	user: service_username,
	password: service_password
};

console.log("MQLight connection config: %s", JSON.stringify(connectionConfig, null, 4));

module.exports = {
	sendMessage: function(topic, body, attrs, callback) {
		attrs.timestamp = new Date().toISOString();
		var options = {
			ttl: 604800000,
			properties: attrs
		};
		createClient(function(client) {
			client.send(topic, body, options, function(err) {
				if (err) {
					console.log("Client %s: Error while sending message: %s", client.id, err);
				} else {
					console.log("Client %s sent %s to topic %s", client.id, body, topic);
				}
				if (callback) {
					callback(err);
				}
				stopClient(client);
			});
		});
	},
	listen: listen,
	listenOnce: function(topic, callback) {
		var client = listen(topic, function(data, delivery) {
			callback(data, delivery);
			stopClient(client);
		});
	},
	readAttributes: function(headers) {
		var attrs = {};
		for (var header in headers) {
            if (!mqutils.isHTTPHeader(header.toLowerCase())) {
                attrs[header] = headers[header];
            }
		}
		return attrs;
	},
	createClient: createClient,
	stopClient: stopClient,
	stopClients: stopClients
};

function listen(topic, callback) {
	return createClient(function(client) {
		client.on('message', callback);
		client.subscribe(topic);		
		console.log("Client %s is listening to %s", client.id, topic);
	});
}

function stopClients(clients) {
	clients.forEach(stopClient);
}

function stopClient(client) {
	if (client != undefined) {
		console.log("Client %s is being stopped", client.id);
		client.stop();
	}
}

function createClient(callback) {
	connectionConfig.id = getClientName();
	return mqlight.createClient(connectionConfig, function(err, client) {
		if (err) {
			console.log("Error during client %s creation %s", client.id, err);
		} else {
			callback(client);
		}
	});
}

var counter = 0;
function getClientName() {
	var clientName = "mrc_client_" + counter;
	counter += 1;
	return clientName;
}