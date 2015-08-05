
var fs = require('fs');
var webdriver = require('selenium-webdriver');
var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;
var argv = require('yargs').argv;
var path = require('path');
var excel = require('node-xlsx');



var xlsxData = [];


var captureDataForAirline = function(data){
    var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

    var website = data.website.url;
    driver.get(website);
    Object.keys(data.accounts).forEach(function(account, ind, arr){

        writeFields(driver, data.accounts[account]);
        driver.findElement(By.css(".linkBtn")).click().then(function(){
            driver.sleep( 100000 );

        });
     });


};


var main = function( ){
   var file = argv._[0];
   console.log(process.env['PWD']);
   fs.readFile(file, 'utf8', function(err, data) {
        if (err) throw err;
        var config = json(data);
        console.log("Read config:\n", config);
        captureDataForAirline(config.hilton_hhonors);
        //new River(config).flow();
   });
};


main();
