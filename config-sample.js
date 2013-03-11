//
// config-sample.js
//
// To run: Add MongoLab REST API credentials, 
// SMTP credentials, and update config.
// Rename this file to config.js
//
config = {
  id: 'test sensor',		// For identifying sensor in logs and emails
  sensorpin : 2,		// Input pin on Arduino to listen to

  apiKey : '<YOUR API KEY FROM MONGOLAB>', // a long hexadecimal number
  database : '<YOUR DATABASE NAME>',	   // a string, e.g. 'testmotion'
  collection : 'mongolab-motion', // Default 

  mailer : {			// Config for npm mailer package 0.6.7
    ssl: true,
    host : 'smtp.sendgrid.net',             // smtp server hostname
    port : 465,                             // smtp server port
    domain : '<YOUR EMAIL DOMAIN>',         // domain used by client to identify itself to server, e.g. example.com
    to : '<YOUR EMAIL RECIPIENT EMAIL ADDRESS>', // e.g. alerts@example.com
    from : '<SENDER EMAIL ADDRESS>',		 // e.g. sensors@example.com
    reply_to:'<REPLY-TO EMAIL ADDRESS>',	 // e.g. sensors@example.com
    authentication : 'login',               // auth login is supported; anything else is no auth
    username : '<YOUR SMTP USERNAME>',	    // username for SMTP auth
    password : '<YOUR SMTP PASSWORD>',      // password
    debug : false			    // log level per message
  },

  // These are used to determine when to send emails
  detectTest : genericTimeTest,
  ceasedTest : genericCountTest
}

function genericCountTest(time, count) {
  if (count % 10 == 0) 		// Send email every 10th event
    return true
  else
    return false
}

function genericTimeTest(time, count) {
  // trigger only after 7pm but before 8am
  if ((time.getHours() >= 19 && time.getHours() <=23) ||
      (time.getHours() >= 0 && time.getHours() <= 8))
    return true
  else
    return false
}

exports.config = config
