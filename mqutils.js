var fs = require('fs');

headers = fs.readFileSync('headers.txt').toString().split('\n');
headers = headers.map(function(header) {
    return header.toLowerCase().replace('\r', '');
});

module.exports = {
    isHTTPHeader: function(header) {
        var isHttpHeader = headers.indexOf(header) != -1;
        return isHttpHeader;
    }
};