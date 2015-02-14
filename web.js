var express = require('express'),
    fs = require('fs'),
    morgan = require('morgan');


var app = express();

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});

app.use(morgan('combined', {stream: accessLogStream}));

var dataBuffer = fs.readFileSync('index.html');
var dataString = dataBuffer.toString('utf8');
app.get('/', function(request, response) {
  response.send(dataString);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
