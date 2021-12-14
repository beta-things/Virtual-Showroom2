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
    var templatesList = await Templates.find().sort('createdAt DESC');
    
    for(i=0; i<templatesList.length; i++){//populate each template
      var dbSlots = await Slot.find({owner: templatesList[i].id}).sort('stackPosition ASC');
      templatesList[i].slots = dbSlots;
      for(v=0; v<templatesList[i].slots.length; v++){ //populate each slot of the template
        //populate this slot with it's parts
        var slotParts = await Parts.find({owner: templatesList[i].slots[v].id}).populate('aliasTrunks');
        templatesList[i].slots[v].parts = slotParts;
        for(p=0; p<templatesList[i].slots[v].parts.length; p++){ //for each part 
          for(t=0; t<templatesList[i].slots[v].parts[p].aliasTrunks.length; t++){ //for each trunk
            var trunk = templatesList[i].slots[v].parts[p].aliasTrunks[t];
            templatesList[i].slots[v].parts[p].aliasTrunks[t].slot = {};
            templatesList[i].slots[v].parts[p].aliasTrunks[t].slot.id = trunk.aliasWhenSlotID;
            var slot = await Slot.findOne({id: trunk.aliasWhenSlotID});
            templatesList[i].slots[v].parts[p].aliasTrunks[t].slot.slotName = slot.slotName;

            templatesList[i].slots[v].parts[p].aliasTrunks[t].part = {};
            templatesList[i].slots[v].parts[p].aliasTrunks[t].part.id = trunk.hasPartID;
            var part = await Parts.findOne({id: trunk.hasPartID});
            templatesList[i].slots[v].parts[p].aliasTrunks[t].part.friendlyName = part.friendlyName;
          }
        }
      }
    }

    // Respond with view.
    return {
      templatesList: templatesList,
    };

  }


};
