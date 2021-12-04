const { setMaxListeners } = require("process");

module.exports = {


  friendlyName: 'Upload screenshot',


  description: '',

  //files: ['photo'],

  inputs: {

    buildCode:{
      type:'string',
      required: true,
      // such as XC9G8
    },
    photo:{
      type: 'ref',
      required: true
    }

  },


  exits: {

  },


  fn: async function (inputs) {

     var base64Data = inputs.photo.replace(/^data:image\/png;base64,/, "");
    //if we are in staging or production send to www 
    if(sails.config.environment == 'staging' || sails.config.environment == 'production'){
      var saveFolder = 'www/screenShotsz/';
    }else{ //else send to .tmp
      var saveFolder = '.tmp/public/screenShots/';
    }

    await require("fs").writeFile(saveFolder+inputs.buildCode+".png", base64Data, 'base64', function(err) {
      if(err){
        sails.log(err);
      }
    });

    // All done.
    return;

  }


};
