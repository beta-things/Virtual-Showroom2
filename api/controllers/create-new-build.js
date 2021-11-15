module.exports = {


  friendlyName: 'Create new build',


  description: 'hit this controller to create a new build for a given customer',


  inputs: {
    customerID:{
      type: "number",
      required: true,
    },
    buildName:{
      type:"string",
      required: true,
    },

  },


  exits: {

  },


  fn: async function (inputs) {
    //make unique alphanumeric code
    var newSessionCode = "";
    var characterLib = "23456789ABCDEFGHJKLMNXXPQRSTUVWXYZ23456789";
    for (var i = 0; i < 5; i++){
      newSessionCode += characterLib.charAt(Math.floor(Math.random() * characterLib.length));
    }

    var duplicateArray = await Builds.find({sessionCode:newSessionCode});

    //check if this code is being used
    while(duplicateArray.length > 0 ){
      newSessionCode = "";
      for (var i = 0; i < 5; i++){
        newSessionCode += characterLib.charAt(Math.floor(Math.random() * characterLib.length));
      }
      duplicateArray = await Builds.find({sessionCode:newSessionCode});
    }

    var defaultTemplate = await Templates.findOne({isActiveTemplate: true});
    
    var DB_object = await Builds.create({owner:inputs.customerID, buildName: inputs.buildName, sessionCode: newSessionCode, template:defaultTemplate.id}).fetch();

    // All done.
    return DB_object;

  }


};
