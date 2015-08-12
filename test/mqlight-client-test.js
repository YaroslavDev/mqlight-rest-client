var assert = require('assert');
var should = require('should');
var request = require('supertest');
var messaging = require('../messaging');
var mocker = require('../mocker');
var mqlightClient = require('../mqlight-client');

describe('MQ Light REST Client', function() {
	describe('POST /events', function() {
		it('should respond immediately with {Status: "Success: OK"}', function(done) {
			request(mqlightClient.app)
				.post("/events")
				.set('Content-Type', 'application/json')
				.send({msg: "How are you?"})
				.expect(200)
				.end(function(err, res) {
					if (err) return done(err);
					res.text.should.equal(JSON.stringify({status: "Success: OK"}))
					done();
				});
		})
	})
	describe('POST /events?topic=chat', function() {
		it('should publish message to chat and immediately respond with {Status: "Success: OK"}', function(done) {
			var msg = {msg: "How are you?"}

			messaging.listenOnce("chat", function(response, delivery) {
				JSON.stringify(response).should.equal(JSON.stringify(msg));
				done();
			});

			request(mqlightClient.app)
				.post("/events?topic=chat")
				.set('Content-Type', 'application/json')
				.send(msg)
				.expect(200)
				.end(function(err, res) {
					if (err) return done(err);
					res.text.should.equal(JSON.stringify({status: "Success: OK"}))
				});
		})
	})
	describe('POST /events?topic=questions&reply_1=answers', function() {
		it('should publish message to "questions", subscribe to "answers" and respond with first message that comes to this topic', function(done) {
			var receiveMsg = { "message": "How are you?" }
			var onTopic = "questions"
			var sendMsg = { "message": "I am fine" }
			var toTopic = "answers"
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

			request(mqlightClient.app)
				.post("/events?topic=questions&reply_1=answers/123/ibm")
				.set('Content-Type', 'application/json')
				.set('attr_x-vcap-request-id', '123')
				.set('attr_provider', 'ibm')
				.send(receiveMsg)
				.expect(200)
				.end(function(err, res) {
					if (err) return done(err);
					res.text.should.equal(JSON.stringify(sendMsg))
					messaging.stopClients(clients);
					done();
				});
		})
	})
});
