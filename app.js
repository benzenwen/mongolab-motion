//
// mongolab-motion: An Arduino motion sensor example that logs to
// MongoLab's REST API and to an email address. 
//

//
// by Ben Wen 
// with thanks to the Arduino community, esp. Rick Waldon for Johnny Five,
// SendGrid for the Uno board, esp. @swiftalphaone for the Waza tutorial.
//

//
// Copyright 2013 Benson Wen.  
//

//
// MIT licensed
//

// March 2013


var five = require('johnny-five'),
board = new five.Board(),
https = require('https'),
mailer = require('mailer'),
config = require('./config').config,
detected = 0, 
ceased = 0;

// Set up event handlers to process motion events.
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
  logMsg({
    '_id' : time.getTime(),
    'sensorid' : config.id,
    'time' : time.toString(),
    'event' : msg
  })

  // FIXME using message string matching is distasteful
  if ((/.*detected.*/.test(msg) && config.detectTest(time, detected)) ||
      (/.*ceased.*/.test(msg) && config.ceasedTest(time, ceased)))
    mailMsg(msg)
}

var email = config.mailer
email.subject = 'mongolab_motion event!'

// TODO: make mailMsg and logMsg use the same msg semantics.
function mailMsg(msg) {
  email.subject = config.id +": " + msg;
  email.body = 'Hello! from mongolab_motion sensor:' + config.id + '.\nMessage: ' + msg
  mailer.send(email, function (err, result) {
    if (err) console.log (err)
    console.log ('mail sent')
  })
}  


function logMsg(msg) {
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
      if (! /.*_id.*/.test(chunk)) 
	console.log('Unexpected server response: ' + chunk)
    })
  })

  // post the data
  req.write(JSON.stringify(msg))
  req.end()
}


