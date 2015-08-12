var AB = require('../original-autobrowser')

var npm = new AB({
  "url": "http://npmjs.com/package/plasmidjs",
  "river": [

  {
    "collectInnerHtml":{
      ".box": "Box"
    }
  }

  ]



})

npm.flow()
