module.exports = {


  friendlyName: 'Set active template',


  description: '',


  inputs: {
    newActiveTemplateID:{
      type: "number",
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    //remove active from all    
    await Templates.update({isActiveTemplate: true}).set({isActiveTemplate:false});
    //set active to new
    await Templates.update({id: inputs.newActiveTemplateID}).set({isActiveTemplate: true});

    //find all to return
    var allTemplates = Templates.find().populate("slots").sort('createdAt DESC');
    
    // All done.
    return allTemplates;

  }


};
