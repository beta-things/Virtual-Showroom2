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

    //populate each slot of each template with that slot's positionOffsetObservances
    for(var i=0; i<templatesList.length; i++){ //iterate through templates
      for(var v=0; v<templatesList[i].slots.length; v++){ //iterate through each slot of this template
        //get slot info by querying the slot model and populating its positionOffsetObservances
        //add these found positionOffsetObservances to the slot 'templatesList[i].slots[v].positionOffsetObservances'
         var slotWithInfo = await Slot.findOne({id: templatesList[i].slots[v].id }).populate('positionOffsetObservances');
         templatesList[i].slots[v].positionOffsetObservances = slotWithInfo.positionOffsetObservances;
      }

    }

    // Respond with view.
    return {templatesList:templatesList};

  }


};
