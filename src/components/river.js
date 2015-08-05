var SRC = '../am-'

var helper = require( SRC + 'helper' );
var logger = require( SRC + 'logger' );

function Promiser( mapped, error ){

    this.array = mapped;
    this.promises = [];
    this.errorCb = error || logger.error;
}

Promiser.prototype = {

    promise: function(getPromise){
        var self = this;
        var newPromise = getPromise(this.array.shift());
        newPromise.then(function(){
            self.promise(getPromise);
        })
    }

}


var AutomataRiver = function(sequence, options) {

    this._options = options || {};
    this._sequence = sequence;

    this.currentInd = 0;

    logger.log('AutomataRiver with options: ', this._options, '\n and sequence:\n', sequence);

    if (!sequence.river)
        loggererror("\nNo list of commands specified for river " +
            "becuase no \"river\" element passed:\n\n",
            sequence, "\n\n    ********    \n\nPlease edit JSON file and try again.\n\n    ********    \n");

};

util.inherits(AutomataRiver, events.EventEmitter);

AutomataRiver.load = function(filename) {
    return new Promise(function(fulfill, reject) {

        helper.tryLoadingStringAsFile(filename)
            .then(function(file) {
                try {
                    var config = JSON.parse(file);
                    fulfill(new AutomataRiver(config));

                } catch (err) {
                    reject(err);
                }
            }, reject);

    })
};

AutomataRiver.flow = function(sequence) {

    return new AutomataRiver(sequence).flow();

};

AutomataRiver.prototype = {

    flow: function(seq) {
        var seq = this._sequence;
        var self = this;
        this._driver = this._driver.build();
        if (seq.url != null) seq.river.unshift({
            visit: seq.url
        });
        return this._start();

    },

    _start: function() {
        logger.log("running ", this._sequence.river)
        try {
            // commands.push({
            //     "quit": true
            // });
            this._runNextCommand();

        } catch (err) {

            logger.error(err);
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

module.exports = AutomataRiver;
