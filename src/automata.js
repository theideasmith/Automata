/*
 * External Modules
 */
var until = require('selenium-webdriver').until;
var Promise = require('promise');
var events = require('events');
var async = require('async');
var path = require('path');
var util = require('util');
var fs = require('fs');

/*
 * Internal Modules
 */

var helper = require('./am-helper');
var logger = require('./am-logger');

var PWD = process.env.PWD;

var Automata = function(sequence, options) {

    this._options = options || {};
    this._sequence = sequence;

    this.currentInd = 0;

    loggerlog('Automata with options: ', this._options, '\n and sequence:\n', sequence);

    if (!sequence.river)
        loggererror("\nNo list of commands specified for river " +
            "becuase no \"river\" element passed:\n\n",
            sequence, "\n\n    ********    \n\nPlease edit JSON file and try again.\n\n    ********    \n");

};

util.inherits(Automata, events.EventEmitter);

Automata.load = function(filename) {
    return new Promise(function(fulfill, reject) {

        autologgerrs.tryLoadingStringAsFile(filename)
            .then(function(file) {
                try {
                    var config = JSON.parse(file);
                    fulfill(new Automata(config));

                } catch (err) {
                    reject(err);
                }
            }, reject);

    })
};

Automata.flow = function(sequence) {

    return new Automata(sequence).flow();

};

Automata.prototype = {

    flow: function() {
        return this._flow(this._sequence);
    },

    _flow: function(seq) {
        var self = this;
        this._driver = this._driver.build();
        if (seq.url != null) seq.river.unshift({
            visit: seq.url
        });
        return this._run();

    },

    _river: function(layer) {
        var fork = layer.river;
        if (fork) new Automata(layer.river).flow();
    },

    _run: function() {
        logger.log("running ", this._sequence.river)
        try {
            // commands.push({
            //     "quit": true
            // });
            this._runNextCommand();

        } catch (err) {

            loggererror(err);
        }

        return this.prevPromise;
    },

    _runNextCommand: function() {

        if (this.currentInd < this._sequence.river.length)
            this._delegateCommand(this._sequence.river[this.currentInd]);
        this.currentInd++;

    },

    _delegateCommand: function(command) {

        var self = this;
        /*
            Setting the current command for future reference
        */
        if (command.flags) {
            command.flags.forEach(function(flag) {
                command[flag] = true;
            });
        }

        var type = helper.captureCommandType(command, );

        self["_" + type](command).then(function() {
            self._runNextCommand();
        });

    }
};

module.exports = Automata;
