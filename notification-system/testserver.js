var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , Redis = require("ioredis")
  , path = require('path')
  , util = require('util')
  , yaml = require('js-yaml');

app.listen(3300);

try {
  var filename = path.join(__dirname, 'sentinel.yml'),
      contents = fs.readFileSync(filename, 'utf8'),
      redisData     = yaml.load(contents);

  console.log(util.inspect(redisData, false, 10, true));
} catch (err) {
  console.log(err.stack || String(err));
}
var masterName = redisData.redis.master_name
var sentinels = redisData.redis.sentinels
var opts = {} // standard node_redis client options

console.log("Master Name: " + masterName);
console.log("Sentinels Name: " + sentinels);

var redis = new Redis({
  sentinels: sentinels,
  name: masterName
});



redis.set('foo', 'bar');
redis.get('foo', function (err, result) {
  console.log(result);
});

function handler (req, res) {
  fs.readFile(__dirname + '/../www/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html' + __dirname);
    }

    res.writeHead(200);
    res.end(data);
  });
}
