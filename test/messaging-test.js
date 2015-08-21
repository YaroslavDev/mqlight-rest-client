var assert = require('assert');
var should = require('should');
var messaging = require('../messaging');

describe('Messaging', function() {
	describe('#createClient()', function() {
		it('should createClient in non-stopped state', function(done) {
			messaging.createClient(function(client) {
				client.id.should.equal("mrc_client_0");
				client.stopped.should.equal(false);
				client.stop(function() {
					client.stopped.should.equal(true);
					done();
				});
			});
		});
	});

	describe('#sendMessage()', function() {
		it('should send message with specified attributes to specified topic', function(done) {
			var msg = {msg: "test_body"}
			var attrs = {test_attribute: "test_value"}
			var topic = "test"

			messaging.listenOnce(topic, function(response, delivery) {
				JSON.stringify(response, null, 4).should.equal(JSON.stringify(msg, null, 4));
				done();
			});

			setTimeout(function() {
				messaging.sendMessage(topic, msg, attrs, function(err) {
					if (err) throw err;
				});
			}, 1000);
		});
	});
});