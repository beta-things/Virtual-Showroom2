module.exports = {

 

  friendlyName: 'Generate pdf',


  description: '',


  inputs: {
    sessionCode:{
      type: "string",
    },
    buildSecret:{
      type: "string",
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    var puppeteer = require("puppeteer");

    if(sails.config.environment == 'staging' || sails.config.environment == 'production'){
      var saveFolder = 'www/screenShots/';
    }else{ //else send to .tmp
      var saveFolder = '.tmp/public/screenShots/';
    }
    
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const options = {
      path: saveFolder+inputs.sessionCode+'.pdf',
      format: 'letter',
    };

    var scrapePage = sails.config.custom.baseUrl;

    await page.goto(scrapePage+'/quote-pdf/'+inputs.sessionCode+'/'+inputs.buildSecret);
    await page.pdf(options);
    await browser.close();


    // All done.
    return;

  }


};
