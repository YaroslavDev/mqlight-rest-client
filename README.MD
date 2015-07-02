# Simple RESTful client to mq-light

## Installation

* Install [node.js](https://nodejs.org/download/)
* Install 3rd party dependencies: 
```python
npm install express   
npm install body-parser   
npm install mqlight  
```
* Run mqlight client:
```python
node mqlight-client.js
```

## User guide

Send a HTTP POST request to localhost:3000/events with following query params:

* __topic__: Topic to which you would like to publish message;
* __succeeded__: OPTIONAL. Topic to which sucessful response should be sent. If not set, responds immediately with {status: "OK"}. Otherwise, responds with message body received from this topic.
* __failed__: OPTIONAL. Topic to which failed response should be sent;
* All headers will be converted to AMQP message attributes;
* When sending JSON in body specify header __Content-Type: application/json__.

Request example:

```python
> POST localhost:3000/events?topic=news/technology&succeeded=news/technology/responses&failed=e/packaging/v1/apis/fetch/integration-failed/#
> Headers:
> Content-Type: application/json
> Body:
> { "message": "iPhone 6S release data" }
```