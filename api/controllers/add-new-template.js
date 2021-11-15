module.exports = {


  friendlyName: 'Add new template',


  description: 'allows a logged in admin to create a new template with slots',


  inputs: {
    templateName:{
      type: "string",
      required: true,
    },
    meshFileName:{
      type:"string",
      required:true,
      example: "mesh_file.GLB"
    },
    slots:{
      type:"json",
      required: true,
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    var slots = JSON.parse(inputs.slots);
    var slotToDBID = [];
    var newTemplate = await Templates.create({templateName : inputs.templateName, 
                                              meshFileName: inputs.meshFileName
                                            }).fetch();
    
    for(i=0; i<slots.length; i++){
      var stackPosition = i;
      var newSlot = await Slot.create({owner:newTemplate.id, 
                          slotName:slots[i].name, 
                          allowEmpty:slots[i].allowedEmpty,
                          nonLineItem:slots[i].nonLineItem,
                          stackPosition:stackPosition}).fetch();

      //store stack position as key for array containing ID of newly made slot
      //this is a running tally of slots with IDs every new slot can only reference slots below it
      slotToDBID[stackPosition] = newSlot.id;

      sails.log("the new slot is");
      sails.log(newSlot);
      
      //if there are  offsetObservances, loop them through and add them to the slot's collectio: positionOffsetObservances
      //slots[i].offsetObservances[v] resolves to a stack position
      //slotToBDID[slots[i].offsetObservances[v]] resolves to that slot's DB ID
      if(slots[i].offsetObservances.length>0){
        for(v=0; v<slots[i].offsetObservances.length; v++){
          await Slot.addToCollection(newSlot.id, 'positionOffsetObservances', slotToDBID[slots[i].offsetObservances[v]]);
        }
      }                    
    }
    
    var allTemplates = Templates.find().populate("slots").sort('createdAt DESC');
    // All done.
    return allTemplates;

  }


};
