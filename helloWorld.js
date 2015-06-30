var mqlight = require('mqlight');
var opts = {
	service: 'amqp://localhost',
	user: 'admin',
	password: 'password'
};
var sendClient = mqlight.createClient(opts);
sendClient.on('started', function() {
    sendClient.send('e/packaging/v1/plan/create/started/123', '{"createPlanInfo": {"name":"Super plan"}}');
});