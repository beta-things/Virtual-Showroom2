module.exports = {


  friendlyName: 'Build parts update',


  description: 'Socket controller for adding, changing, and deleting build parts',


  inputs: {
    connect:{
      type: "boolean",
      defaultsTo: false
    },
    slotIndex:{
      type: "number"
    },
    offstageIndex: {
      type: "number"
    },
    slotID:{
      type: "number"
    },
    newPartId:{
      type: "number"
    },
    sessionCode:{
      type: "string",
      required: true
    },
    buildID:{
      type: "number",
      required: true
    },
    delete:{
      type:"boolean",
      defaultsTo: false,
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    
    if(inputs.connect){//if this is only a socket connect request
      sails.sockets.join(this.req, inputs.sessionCode);
    }else{
      if(this.req.me){ //sales agent uses this method to call a part add, change, or delete
          //get the template ID by the build ID
          var build = await Builds.findOne({id:inputs.buildID});
          //get the template with slots 
          var template = await Templates.findOne({id:build.template}).populate('slots');
         
        if(inputs.delete){
        
          //for each, in this slot and above, search delete from Buildparts
          for(i=inputs.slotIndex; i<template.slots.length; i++){
            await Buildparts.destroy({slot: template.slots[i].id});
          }

        }else{
          var buildPartInSlot = await Buildparts.findOne({slot: inputs.slotID, AssociatedBuild: inputs.buildID});
          if(buildPartInSlot){//do we have any buildparts for this slot?
            //for each above this slot, delete from Buildparts
            for(i=inputs.slotIndex+1; i<template.slots.length; i++){
              await Buildparts.destroy({slot: template.slots[i].id});
            }
            await Buildparts.update({id:buildPartInSlot.id})
            .set({
              part : inputs.newPartId,
            });
          }else{//no buildParts for slot so we can just add
            //for each, in this slot and above, search delete from Buildparts
            for(i=inputs.slotIndex; i<template.slots.length; i++){
              await Buildparts.destroy({slot: template.slots[i].id});
            }
            await Buildparts.create({AssociatedBuild: inputs.buildID, part: inputs.newPartId, slot: inputs.slotID});
          }

        }

        //POPULATE-SLOT-PARTS HELPER also returns build object
        var helper_return = await sails.helpers.populateSlotParts.with({
          sessionCode:inputs.sessionCode, 
        });
        var templateWithSlots = helper_return.templateWithSlots;
        var build = helper_return.build;

        sails.sockets.broadcast(inputs.sessionCode, 'build-parts-change', 
        {
          build: build,
          templateWithSlots: templateWithSlots,
          deleted: inputs.delete,
          slotIndex:inputs.slotIndex, 
          slotID: inputs.slotID, 
          offstageIndex: inputs.offstageIndex
        });

      }
    }
    
    
    // All done.
    return;

  }


};
