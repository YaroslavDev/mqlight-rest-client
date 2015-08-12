var mocker = require('../mocker');
var assert = require('assert');
var should = require('should');
var messaging = require('../messaging');

describe('Mocker', function() {
	describe('#appendAttribute', function() {
		it('should append attribute after / to specified topic', function() {
			var attributes = { x: 1, y: 2 }

			var topic = mocker.appendAttribute("test", attributes, "x")

			topic.should.equal("test/1")
		})
	})

	describe('#mockServiceFromJSON()', function() {
		it('should send message back when receiving message on topic specified in rule', function(done) {
			var receiveMsg = { "message": "How are you?" }
			var onTopic = "chat/programmers/questions"
			var sendMsg = { "message": "I am fine" }
			var toTopic = "chat/programmers/answers"
			var rules = {
				rules: [
					{
						recv: receiveMsg,
						on: onTopic,
						send: sendMsg,
						to: toTopic
					}
				]
			}

			var clients = mocker.mockServiceFromJSON(rules)

			messaging.listenOnce(toTopic, function(response, delivery) {
				JSON.stringify(response, null, 4).should.equal(JSON.stringify(sendMsg, null, 4));
				messaging.stopClients(clients);
				done();
			});
			messaging.sendMessage(onTopic, receiveMsg, {}, function(err) {
				if (err) throw err;
			})
		})

		it('should send message back when receiving message with x-vcap-request-id and provider on topic/{id}/{provider', function(done) {
			var receiveMsg = { "message": "How are you?" }
			var onTopic = "chat/programmers/questions"
			var sendMsg = { "message": "I am fine" }
			var toTopic = "chat/programmers/answers"
			var rules = {
				rules: [
					{
						recv: receiveMsg,
						on: onTopic,
						send: sendMsg,
						to: toTopic
					}
				]
			}

			var clients = mocker.mockServiceFromJSON(rules)

			messaging.listenOnce(toTopic + "/123/ibm", function(response, delivery) {
				JSON.stringify(response, null, 4).should.equal(JSON.stringify(sendMsg, null, 4));
				messaging.stopClients(clients);
				done();
			});
			messaging.sendMessage(onTopic, receiveMsg, {"x-vcap-request-id": "123", "provider": "ibm"}, function(err) {
				if (err) throw err;
			})
		})
	})
})