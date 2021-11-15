module.exports = {


  friendlyName: 'View edit parts',


  description: 'Display "Edit parts" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/dashboard/edit-parts'
    }

  },


  fn: async function () {
    //get all templates
    var templatesList = await Templates.find().populate("slots").sort('createdAt DESC');
    //populate templatesList with parts that call it out
    for(i=0; i<templatesList.length; i++){
      
      for(v=0; v<templatesList[i].slots.length; v++){
        var slotParts = [];
        //check for parts that reference this slot and add to an array that will be added to the slot
        slotParts = await Parts.find({owner: templatesList[i].slots[v].id});
        templatesList[i].slots[v].parts = slotParts;
      }
      
    }
    // Respond with view.
    return {
      templatesList: templatesList,
    };

  }


};
