var jwt = require('jsonwebtoken');
var express = require('express');
var app = express();
var http = require('http');
// other requires

app.post('/auth', function (req, res) {

  // TODO: validate the actual user user
  var profile = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@doe.com',
    id: 123
  };

  // we are sending the profile in the token
  var token = jwt.sign(profile, 'Super Secret', { expiresInMinutes: 60*5 });

  res.json({token: token});
});

var server = http.createServer(app);
