//utils Test
var utils = require('../controllerUtils.js')

//email tests
//invalid email returns false
var badEmail = "ojh12345@gmail"
if(utils.verifyEmail(badEmail)==false){
    printk('Test Passed')
  }
else{
  printk('Test failed')
}
