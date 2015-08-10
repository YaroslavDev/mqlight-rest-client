# Simple RESTful client to mq-light

## Installation

* Install [node.js](https://nodejs.org/download/)
* Clone project, go to project directory and install 3rd party dependencies by running: 
```python
npm install
```
* Indicate host, username and password to mqlight in _messaging.js_. Defaults are amqp://localhost, admin, password.
* Having MQ Light turned on, run mqlight client:
```python
node mqlight-client.js
```

## Message Producer user guide

Send a HTTP POST request to localhost:3000/events with following query params:

* __topic__: Topic to which you would like to publish message;
* __succeeded__: OPTIONAL. Topic to which sucessful response should be sent. If not set, responds immediately with {status: "OK"}. Otherwise, responds with message body received from this topic.
* __failed__: OPTIONAL. Topic to which failed response should be sent;

You can specify following headers:

* __reply-id__: OPTIONAL. If specified, this request id will be appended to response topic of mocked service separated with '/'.
* __provider__: OPTIONAL. If specified, this will be appended to response topic of mocked service separated with '/'.
* When sending JSON in body specify header __Content-Type: application/json__.
* All headers will be converted to AMQP message attributes.

Request example:

```python
> POST localhost:3000/events?topic=news/technology&succeeded=news/technology/responses&failed=news/technology/failures
> Headers:
> Content-Type: application/json
> Body:
> { 
> 	"message": "iPhone 6S release data" 
> }
```

This will publish a message with JSON contained in request body on topic _news/technology_ and subscribe to 2 topics: _news/technology/responses_ and _news/technology/failures_. First message that arrives on any of these 2 topics will be returned to user, and server will unsunscribe from both __succeeded__ and __failed__ topics.

If you specify only sending topic, then client will publish a message and respond immediately with:
```json
{
	"Success": "OK"
}
```

It is possible to specify only __succeeded__ or/and __failed__. Then client will not publish any messages, and will start listening to specified topics. First response arrived to any of this topics, will be sent to user.

## Message Consumer user guide

It is possible to mock service with some default behavior defined by set of rules. Below is sample of JSON containing such rules.

```json
{
	"rules": [
		{
			"recv": {
				"message": "How are you?"
			},
			"on": "chat/programmers/questions",
			"send": {
				"message": "I am fine"
			},
			"to": "chat/programmers/answers"
		}
	]
}
```

This should be understood as follows: When a message containing __recv__ is received on topic __on__, send message containing __send__ to topic __to__.

In order to turn on message consumer indicate rule file as command line parameter:
```python
node mqlight-client.js <rule-file>
```

Or you can send a POST request that updates mocker rules without restarting the application:

```python
> POST localhost:3000/mock
> Headers:
> Content-Type: application/json
> Body:
> {
>	"rules": [
>		{
>			"recv": {
>				"message": "How are you?"
>			},
>			"on": "chat/programmers/questions",
>			"send": {
>				"message": "I am fine"
>			},
>			"to": "chat/programmers/answers"
>		}
>	]
> }
```

## Deploy on Bluemix

Application is ready to be deployed on Bluemix. Go to project directory and run:

```python
cf push
```

This will read _manifest.yml_ that contains information necessary for deployment on Bluemix. For more details have a look at [documentation](https://www.ng.bluemix.net/docs/#starters/nodejs/index.html#nodejs). Feel free to play with space and memory since application does not require a lot of resources.

```lang
---
applications:
- name: mqlight-rest-client
  disk_quota: 1024M
  host: mqlight-rest-client
  path: .
  command: node mqlight-client.js
  instances: 1
  memory: 256M
  services:
  - mqlight

```

## License

[MIT](http://opensource.org/licenses/MIT)