module.exports = {


  friendlyName: 'View edit template',


  description: 'Display "Edit template" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/dashboard/edit-template'
    }

  },


  fn: async function () {
    //get all templates with slots 
    var templatesList = await Templates.find().populate("slots").sort('createdAt DESC');

    //populate each slot of each template with that slot's posOffObserve
    for(var i=0; i<templatesList.length; i++){ //iterate through templates
      for(var v=0; v<templatesList[i].slots.length; v++){ //iterate through each slot of this template
        //get slot info by querying the slot model and populating its posOffObserve
        //add these found posOffObserve to the slot 'templatesList[i].slots[v].posOffObserve'
         var slotWithInfo = await Slot.findOne({id: templatesList[i].slots[v].id }).populate('posOffObserve');
         templatesList[i].slots[v].posOffObserve = slotWithInfo.posOffObserve;
      }

    }

    // Respond with view.
    return {templatesList:templatesList};

  }


};
