var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , Redis = require("ioredis");

app.listen(3300);

/*eslint-disable no-console*/

var path = require('path');
var util = require('util');
var yaml = require('js-yaml');


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

var redisClient = new Redis({
  sentinels: sentinels,
  name: masterName
});


/**
 * Our redis client which subscribes to channels for updates
 */
//  redisClient = redis.createClient( 6379, '10.29.52.27'); //redis server
// redisClient.connect().then(function () {
//         throw new Error('Expect `connect` to be thrown');
//       }).catch(function (err) {
//         console.log('All sentinels are unreachable. Last error: just rejected' + err);
//       });


//look for connection errors and log
redisClient.on("error", function (err) {
    console.log("error event - " + redisClient.host + ":" + redisClient.port + " - " + err);
});

/**
 * subscribe to redis channel when client in ready
 */

 redisClient.on('message', function (channel, message) {
  console.log(channel, message);
});

redisClient.on('ready', function() {
  console.log("Redis Connected")
  redisClient.subscribe('notif');
});
/**
 * Dummy redis client which publishes new updates to redis
 */
//redisDummyPublishClient = redis.createClient( 6379, '10.29.52.27');
var redisDummyPublishClient = new Redis({
  sentinels: sentinels,
  name: masterName
});
/**
 * http handler, currently just sends index.html on new connection
 */
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

/**
 * set socket.io log level to warn
 *
 * uncomment below line to change debug level
 * 0-error, 1-warn, 2-info, 3-debug
 *
 * For more options refer https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
 */
//io.set('log level', 3);

/**
 * socket io client, which listens for new websocket connection
 * and then handles various requests
 */
io.sockets.on('connection', function (socket) {

  //on connect send a welcome message
  socket.emit('message', { text : 'Welcome!' });

  //on subscription request joins specified room
  //later messages are broadcasted on the rooms
  socket.on('subscribe', function (data) {
    socket.join(data.channel);
  });
});



/**
 * wait for messages from redis channel, on message
 * send updates on the rooms named after channels.
 *
 * This sends updates to users.
 */
redisClient.on("message", function(channel, message){
  console.log('Receive message %s from channel %s', message, channel);
    var resp = {'text': message, 'channel':channel}
    io.sockets.in(channel).emit('message', resp);
});

/**
 * Simulates publish to redis channels
 * Currently it publishes updates to redis every 5 seconds.
 */
setInterval(function() {
  console.log('Publish messages');
  var no = Math.floor(Math.random() * 100);
  redisDummyPublishClient.publish('notif', 'Generated random no ' + no);
}, 5000);
