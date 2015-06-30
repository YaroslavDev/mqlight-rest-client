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

Send a HTTP POST request to localhost:3000/event with following headers:
out: Topic to which you would like to publish message.
succeeded: Topic to which sucessful response should be sent.
failed: OPTIONAL. Topic to which failed response should be sent.