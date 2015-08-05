STATUS = "DEVELOPMENT";

var events = require('events');
// var uuid = require('uuid') || {};
var moment = require('moment');
var path = require('path');

//Logging
var LOG_PATH = path.join(__dirname, '../logs');
var DEFAULT_LOG = path.join(LOG_PATH,"River_Default.log");

var log4 = require('log4js');
log4.configure({
  appenders: [
    { type: "console" },
    { type: 'file', filename: DEFAULT_LOG, category: 'river' }
    ]
});
var logger = log4.getLogger('river');



var defaults = {};

var values = function(obj){
       var keys = Object.keys(obj);
       var values = [];
       for(var v = 0; v < keys.length; v++){
           values.push(obj[keys[v]]);
       };
       return values;
}


var helpers = {
  error: function() {
    var args = values(arguments);

    logger.error.apply(logger, args);
    process.exit(1);
  },
  verbose: function(){
    if(STATUS == 'DEVELOPMENT') this.log.apply(this, values(arguments));
    return this;
  },
  log: function() {
    var args = values(arguments);
    logger.info.apply( logger, args );
    return this;
  },
  print: function() {
     var a = values(arguments);
    this.puts.apply(this, a);

    return this;
  },
  puts: function(){
    var a = values(arguments);
    console.log.apply(console, a);
    return this;
},
  emitter: new events.EventEmitter()
};




module.exports = helpers;
