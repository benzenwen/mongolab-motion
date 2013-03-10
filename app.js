//
// mongolab-motion: Arduino motion detector logging to MongoLab
//

// by Ben Wen 
// with thanks to the Arduino community, esp. Rick Waldon for Johnny Five,
// SendGrid for the Uno board, esp. @swiftalphaone for the Waza tutorial.

//
// Copyright 2012 Ben Wen.  
//

//
// MIT Licensed
//


var five = require('johnny-five'),
board = new five.Board(),
https = require('https'),
config = require('./config').config,
detected = 0, 
ceased = 0;


board.on('ready', function() {
  var button = new five.Button(config.sensorpin)

  board.repl.inject({
    button: button
  })

  button.on('down', function() {
    noteEvent ('Motion detected.')
    detected = detected + 1
  })
  
  button.on('up', function() {
    noteEvent('Motion detection ceased.')
    ceased = ceased + 1
  })
})

function noteEvent(msg) {
  var time = new Date ()
  console.log(time.toString() + ': ' + msg)
  postMsg({
    '_id' : time.getTime(),
    'time' : time.toString(),
    'event' : msg
  })
}

var idmatch = /.*_id.*/

function postMsg(msg) {
  var options = {
    host: 'api.mongolab.com',
    port: '443',
    path: '/api/1/databases/' + config.database + '/collections/' + config.collection
      + '?apiKey=' + config.apiKey,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      if (! idmatch.test(chunk)) 
	console.log('Unexpected server response: ' + chunk)
    })
  })

  // post the data
  req.write(JSON.stringify(msg))
  req.end()
}


