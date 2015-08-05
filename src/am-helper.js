var promise = require('promise');
var _ = require('lodash');
var logger = require('./am-logger');
var fs = require('fs');
var path = require('path');

var AutoHelpers = {

    tryJson: function(str) {

        //thanks to Matt H. on stackoverflow: http://stackoverflow.com/a/20392392.
        try {
            var o = JSON.parse(str);
            if (o && typeof o === "object" && o !== null) return o;
        } catch (e) {}
        return str;
    },

    captureCommandType: function(command, validCommands) {
        /*
            Getting the command type
        */
        var matches = _.intersection(_.keys(command), validCommands);
        if (matches.length > 1) logger.error("AutoHelper ERROR: More than one command passed in command object: " + matches);
        if (matches.length == 0) logger.error("AutoHelper ERROR:" + " Command\n", command, "\nIs not of a valid type. Valid commands are:\n", validCommands.toString());
        return matches.pop();
    },

    tryLoadingStringAsFile: function(string) {
        var self = this;

        logger.log("Am-Helper#tryLoadingStringAsFile passed string: ", string, " $PWD is " + process.env.PWD);
        var fname = string;

        return new Promise(function(fulfill, reject) {

            fs.exists(fname, function(exists) {
                if (exists) {
                    fs.readFile(fname, 'utf8', function(err, file) {
                        if (err) reject(err);
                        logger.log("AutoHelper#tryLoadingStringAsFile captured file: ", file);
                        fulfill(file);
                    });
                } else {
                    logger.log("AutoHelper#tryLoadingStringAsFile captured string: ", string);
                    fulfill(string);
                }
            });

        });
    },

    tryLoadingFileAsJSON: function(path) {
        var self = this;
        return new Promise(function(fulfill, reject) {
            self.tryLoadingStringAsFile(path)
            .then(function(file) {
                try {
                    var json = JSON.parse(file);
                    fulfill(json);
                } catch (err) {
                    reject(err);
                }
            });
        });
    },

    captureValueFromString: function(string) {
        var self = this;
        logger.log("Am-Helper#captureValueFromString passed string: ", string);

        return new Promise(function(fulfill, reject) {
            self.tryLoadingStringAsFile(string)
            .then(function(newString) {
                valued = tryJson(newString);
                fulfill(valued);
            }, reject);
        });
    }
};

module.exports = AutoHelpers;
