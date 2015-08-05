
/**
 * External Modules
 */
var _ = require('lodash');
var webdriver = require('selenium-webdriver');
var By = require('selenium-webdriver').By;
var Promise = require('promise');
var conduit = require('conduitjs');
var events = require('events');
var async = require('async');
var util = require('util');

/**
 * Internal Modules
 */
var SRC = './src/'
var logger = require(SRC + 'am-logger');
var helper = require(SRC + 'am-helper');

function ifArrayNotEmpty(array, cb){

    if(element = array.shift()){
        cb(element, array);
    }

}


/**
 * A quick checker to detect whether you have hit the last index of an array
 */

function isLastInd(ind, array) {
    return ind == (array.length-1);
}

function elemGetText(elem){ return elem.getText(); }
function elemGetInnerHtml(elem){ return elem.getInnerHtml(); }


function AutoBrowser( sequence ){
    var self = this;
    /*
     *  ErrorChecking
     */
    if (!sequence) AutoBrowser.errorFunc("AutoBrowser@AutoBrowser() no sequence passed. Aborting");
    if (!sequence.river)
        AutoBrowser.errorFunc("\nNo list of commands specified for river " +
            "becuase no \"river\" element passed:\n\n",
            sequence, "\n\n    ********    \n\nPlease edit JSON file and try again.\n\n    ********    \n");

    /*
     * Setting Instance options
     */
    var options = sequence.options || {};
    this.options = options;
    AutoBrowser.errorFunc = options.onError || logger.error;
    this.persist = options.persist || false;

    /*
     * The core sequence chain, describing the steps of actions this AutoBrowser instance should take
     */
    this.sequence = sequence;

    /*
     * Stateful information
     */
    this.currentInd = 0;
    this.visitedUrl = false;
    this.currentUrl = null;
    this.currentRiver = sequence.river;

    /*
     * Creating the webdriver instance used for browser automation
     */

    this.driver = new webdriver.Builder()
    .forBrowser( this.sequence.browser || AutoBrowser.defaults.browser );

    logger.log('AutoBrowser with options: ', this.options, '\n and sequence:\n', sequence);

    /*
     * Disabling all valid commands if a page hasn't yet been loaded
     * Obviously, all commands will fail, so it isn't even worth it to run them.
     */
     /*
    _.map(AutoBrowser.validCommands, function(funcName){

        //Obviously don't invalidate visit.
        if (funcName !== 'visit'){

            //Using the Conduit module. Thanks @ifAndElse for the great work.
            self[funcName] = new conduit.Async({context: self, target: self[funcName]})

            //A predicate checker
            self[funcName].before(function(next, command){

                //Only visit next url if a page has been loaded
                if (self.visitedUrl == true) next(command);
                //Otherwise, throw an error
                else AutoBrowser.errorFunc("AutoBrowser@"+funcName+" cannot execute command before first visiting a url. No url visited");
            });
        }
    });
    */

}

util.inherits(AutoBrowser, events.EventEmitter);

AutoBrowser.errorFunc = logger.error;

AutoBrowser.validCommands = [

    'visit', //Visit a new page
    'river', //AutoBrowser - top level river, or a fork in the super-river
    'submit', //Submit a form by entering the given data into the elements for the given selectors.
    //Tries to bypass capthces
    'enter',
    'collect', //Collect data from the webpage
    'sleep', //Wait for x milliseconds
    'quit'

];

AutoBrowser.validFlags = {
        'humanlike': {}, //Make interaction as humanlike as possible
        'async': {}
};

AutoBrowser.validTopLevelFlags = {
    'persist': {}
};

AutoBrowser.validTopLevelCommands = [
    'url'
];

AutoBrowser.defaults = {
        browser: "firefox"
};

AutoBrowser.load = function(filename) {
    return new AutoBrowser(helper.tryLoadingFileAsJSON(filename));
};

AutoBrowser.flow = function(sequence) {
    return new AutoBrowser(sequence).flow();
};

AutoBrowser.prototype = {

    flow: function() {
            this._flow();
    },

    _flow: function() {
        var self = this;
        this.driver = this.driver.build();
        if (this.sequence.url != null) this.currentRiver.unshift({
            visit: this.sequence.url
        });
        return this.run();

    },

    river: function(layer) {
        var fork = layer.river;
        if (fork) new AutoBrowser(layer.river).flow();
    },

    run: function() {
        logger.log("AutoBrowser@run ", this.currentRiver)
        if(this.persist === true) this.currentRiver.push({ "quit": true });

        this.runNextCommand();

    },

    add: function( command ){

    },

    runNextCommand: function() {

        if (this.currentInd < this.currentRiver.length)
            this.delegateCommand(this.currentRiver[this.currentInd]);
        this.currentInd++;

    },

    delegateCommand: function(command) {

        var self = this;
        /**
         * This is done so that you don't need to search through all the flags each time you want to discern whether a certain flag has been passed
         */
        if (command.flags) {
            command.flags.forEach(function(flag) {
                command[flag] = true;
            });
        }

        var type = helper.captureCommandType(command, AutoBrowser.validCommands);
        logger.log('Command of type: ', type);
        self[type](command).then(function() {
            self.runNextCommand();
        }, AutoBrowser.errorFunc);

    },

    concatRiverIntoRiver: function( riverA, riverB ){

    },

    reset: function( ) {
        this.currentInd = 0;
        this.currentUrl = null;
        this.visitedUrl = false;
        return this;
    },

    restart: function() {
        this.quit();
        this.reset();
        this.flow();
    },

    /*
     * Quits the AutoBrowser sequence
     */
    quit: function() {
        this.driver.quit();
        this.reset();
    },

    /**
     *
     * COMMANDS:
     *
     * Visit: visits a url
     * Collect: collects the data inside given html tags and stores in a stream
     * Login: same as submit
     * Submit: submits a form with values for the given CSS selectors
     * Wait: Halts for a certain amount of time
     *
     * SYNTAX:
     * type: COMMAND_TYPE
     * COMMAND_TYPE: {
     *  custom_key: custom_value
     * }
     * predetermined_key: custom_value
     * Options: (all options for all commands. Any command_specfic option entered as "predetermined_key")
     *   option_key: value
     */

    sendKeysWithDelay: function(letters, field, ms) {
        var millis = millis || 0;
        var self = this;

        return new Promise(function(fulfill, reject) {
            logger.log("AutoBrowser@sendKeysWithDelay given letters: ", letters);

            helper.tryLoadingStringAsFile(letters)
            .then(function(value) {
                logger.log("AutoBrowser@sendKeysWithDelay loaded ", letters, "as ", value);

                value.split("").forEach(function(letter, ind, arr) {

                    /**
                     * Delaying before writing
                     */
                    var res = self.driver.sleep(ms).then(
                        function() {
                            return field.sendKeys(letter)
                        },
                        reject
                    );

                    /**
                     * After writing letters, if the write was successful
                     */
                    res.then(
                        function() {
                            logger.log("AutoBrowser@_sendKeysWithDelay sent letter ", letter);
                        },
                        reject
                    );

                    /**
                     * If the last letter is written, then fulfill the promise.
                     */
                    if (ind == (arr.length - 1)) {
                        res.then(
                            function() {
                                logger.log("AutoBrowser@_sendKeysWithDelay sent ");
                                fulfill(true);
                            },
                            reject
                        );
                    }

                });
            },AutoBrowser.errorFunc);
        });
    },

    sendKeys: function(letters, field) {

        var self = this;
        return new Promise(function(fulfill, reject) {
            /**
             * Capturing the implied value of the string,
             * Maybe it is a file, json, etc.
             */
            helper.tryLoadingStringAsFile(letters)
                .then(
                    function(value) {
                        return field.sendKeys(value);
                    },
                    reject
                ).then(fulfill, reject);
        });

    },

    ifElementPresent: function(selector) {
        var self = this;

        return new Promise(function(fulfill, reject) {
            /**
             * Check if the wanted element is present
             */
            self.driver.isElementPresent(By.css(selector))
                .then(
                    function(present) {
                        //Reject if the element was not found / does not exist

                        if (present == false) {
                            reject("AutoBrowser@_ifElementPresent could not locate element: " + selector);
                        } else {
                            logger.log("AutoBrowser@_ifElementPresent found element: ", selector);
                            fulfill(self.driver.findElement(By.css(selector)));
                        }

                    },AutoBrowser.errorFunc );
        });

    },


    ifElementsPresent: function(selector) {
        var self = this;

        return new Promise(function(fulfill, reject) {
            /**
             * Check if the wanted element is present
             */
            self.driver.isElementPresent(By.css(selector))
                .then(
                    function(present) {
                        //Reject if the element was not found / does not exist

                        if (present == false) {
                            reject("AutoBrowser@_ifElementPresent could not locate element: " + selector);
                        } else {
                            logger.log("AutoBrowser@_ifElementPresent found element: ", selector);
                            fulfill(self.driver.findElements(By.css(selector)));
                        }

                    }, AutoBrowser.errorFunc );
        });

    },


    click: function(selector) {
        var self = this;
        return new Promise(function(fulfill, reject) {
            self.ifElementPresent(selector)
                .then(
                    function(button) {
                        return button.click();
                    },
                 AutoBrowser.errorFunc)
                .then(function(){
                    logger.log("AutoBrowser@click clicked element: ", selector, "successfully");
                    fulfill();
                }, AutoBrowser.errorFunc);
        });

    },


    writeFields: function(fields) {
        var self = this;
        return new Promise(function(fulfill) {

            _.forOwn(fields, function(data, selector) {

                self.ifElementPresent(selector)
                    .then(
                        function(field) {
                            var res = self.sendKeys(data, field);
                            if (ind == (arr.length - 1))
                                res.then(fulfill, reject);
                        }, AutoBrowser.errorFunc);

            });
        });
    },

    writeFieldsHumanlike: function(fields) {
        var self = this;
        logger.log("AutoBrowser@_writeFieldsHumanlike writing fields: ", fields);
        return new Promise(function(fulfill, reject) {

            Object.keys(fields).forEach(function(selector, ind, arr) {
                var data = fields[selector];
                var res = self.ifElementPresent(selector)
                    .then(
                        function(field) {
                            console.log("Element HTML was present");
                            return self.sendKeysWithDelay(data, field, fields.characterdelay || 10);
                        },AutoBrowser.errorFunc );

                if (ind == (arr.length - 1)){
                    res.then(
                        function() {
                            logger.log("AutoBrowser@_writeFieldsHumanlike written fields: ", fields);
                            fulfill();
                        });
                }
            });
        });
    },

    submit: function(form) {
        logger.log("AutoBrowser@submit succesfully received form: ",form);

        var self = this;
        if (!form.button) AutoBrowser.errorFunc("AutoBrowser@_submit ERROR: no login button selector passed for login" + form);

        return new Promise(function(fulfill, reject) {
            logger.log("AutoBrowser@submit succesfully entered promise: ", form.submit);

            var res = self.writeFieldsHumanlike(form.submit)
            .then(function() {
                logger.log("AutoBrowser@submit succesfully entered fields: ",form.submit);
                self.click(form.button)
                .then(function(){
                    logger.log("AutoBrowser@submit clicked button: ", form.button);
                    fulfill();
                });
            }, AutoBrowser.errorFunc);

        });
    },

    enter: function(data) {
        var self = this;
        return new Promise(function(fulfill, reject) {


            if (data.humanlike == true){
                self.writeFieldsHumanlike(data.enter)
                .then(function(){
                    logger.log("AutoBrowser@enter entered fields humanlike.");
                    fulfill();
                }, function(err){
                    AutoBrowser.errorFunc(err);
                });


            } else {
                self.writeFields(data.enter).then(fulfill);
            }

        });
    },

    sleep: function(wait) {
        var self = this;
        return new Promise(function(fulfill, reject) {
            if (wait.sleep) {
                logger.log("AutoBrowser@_sleep sleeping: " + wait.sleep);
                self.driver.sleep(wait.sleep).then(fulfill);
            } else {
                reject("AutoBrowser@_sleep no sleep: ms passed");
            }
        });
    },

    visit: function(visit) {

        var self = this;
        logger.log("AutoBrowser@visit visiting " + visit.visit);

        return new Promise(function(fulfill, reject) {
            self.driver.get(visit.visit)
                .then(function() {
                    self.currentUrl = visit.visit;
                    self.visitedUrl = true;
                    fulfill();
                }, AutoBrowser.errorFunc);
        })

    },

    collectNextAndBuild: function(result, array, cb, webdriverCollector){
        var collector = webdriverCollector || elemGetText;

        result = result || {};
        var self = this;

        if (!cb) AutoBrowser.errorFunc("AutoBrowser@collectNextAndBuild no callback passed");
        /**
         * Tag is an object in the following format:
         * {
         *   selector: <selector>,
         *   columnName: <columnName>
         * }
         */
        if (tag = array.shift()){

            /**
             * Check if the element requested exists.
             * At this stage in the project, if the element doesn't exist,
             * then quit.
             */

            self.ifElementsPresent(tag.selector)
            .then(function(elements){

                /**
                 * Results stores the innerHtml of all elements matching tag.selector
                 */
                var innerHtmls = [];
                /**
                 * For each element, get the innerHtml and add it to results.
                 * this could be optimized and only run if there is >1 element
                 * but the benefits are marginal and complicate things.
                 */
                function handler(elem, elems){
                    collector(elem)
                    .then(function(innerHtml){
                        innerHtmls.push( innerHtml );
                        /**
                         * If you have collected the innerHtml for all elements
                         * matching tag, then move on to the next tag
                         */
                        if (innerHtmls.length == elements.length){
                            logger.log("AutoBrowser@collect finished capturing innerHtmls");

                            result[ tag.columnName ] = innerHtmls;
                            self.collectNextAndBuild( result, array, cb);
                        } else {
                            ifArrayNotEmpty(elems, handler);
                        }

                    },self.errorFunc);
                }

                ifArrayNotEmpty(elements, handler);

            }, self.errorFunc);

        } else {
            /**
             * If the array is empty and no more tags left, call the callback
             */
            logger.log("AutoBrowser@collectNextAndBuild collected: ", result);
            cb(result);
        }
    },

    /**
     * Scrapes data from a webpage. Specify the CSS selectors
     *
     * @param {Object} fields an object containing CSS selectors as the keys and tags as the values
     * @returns {Object} Returns an object where the tags from the input object are the keys.
     * Each key maps to an array of values extracted from all CSS elements matching the selector associated with the key.
     * @example
     *
     * collect({
     *  ".email-subject": "Subject"
     *  ".email-text": "Text"
     * });
     * // => { "Subject":"Invitation to Aaron's Birthday Bash", "Text":"Dear Friends and Family, ..." }
     */
    _collect: function(fields, webdriverCollector) {
        var self = this
        return new Promise(function(fulfill, reject){
            var collection = fields.collect;
            var keys = _.keys(collection);
            var tags = keys.map(function(key){
                var value = collection[key];
                return {
                    selector: key,
                    columnName: value
                };
            });

            logger.log("AutoBrowser@collect gotten tags: ", tags);

            self.collectNextAndBuild(null, tags, function(results){
                fulfill( results );
            }, webdriverCollector);

        });
    },

    collectText: function(fields){
        var res =  this._collect(fields, elemGetText);
        this.emit("collect", res);
        return res;
    },

    collectInnerHtml: function(fields){
        var res = this._collect(fields, elemGetInnerHtml);
        this.emit("collect", res);
        return res;
    },

    collect: function(fields){
        return this.collectText(fields);
    }

};

function Exported(sequence){
    this.autobrowser = new AutoBrowser( sequence );

}


module.exports = AutoBrowser;
