
var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder()
.forBrowser( 'firefox')
.build()
.sleep(10000);
