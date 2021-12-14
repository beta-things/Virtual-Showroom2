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
    },
    tourMode:{
      type: "boolean",
      defaultsTo: false,
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    var clearSlotList=[];

    if(inputs.connect){//if this is only a socket connect request
      sails.sockets.join(this.req, inputs.sessionCode);
    }else{
      if(this.req.me){ //sales agent uses this method to call a part add, change, or delete
        //get the template ID by the build ID
        var build = await Builds.findOne({id:inputs.buildID});
        //get the template with slots 
        var template = await Templates.findOne({id:build.template}).populate('slots');
         
        if(inputs.delete){//this is a part delete call
        
          //remove only parts above which observe this one for offsets
          clearSlotList = await sails.helpers.safeRemove.with({//return an array of slots indecies to clear to be given to the front end.
            slotID: inputs.slotID,
            AssociatedBuild: inputs.buildID,
          });

        }else{//this is either an add or update
          var buildPartInSlot = await Buildparts.findOne({slot: inputs.slotID, AssociatedBuild: inputs.buildID});
                    
          //remove only parts above which observe this one for offsets
          clearSlotList = await sails.helpers.safeRemove.with({//return an array of slots indecies to clear to be given to the front end.
            slotID: inputs.slotID,
            AssociatedBuild: inputs.buildID,
          });

          await Buildparts.create({AssociatedBuild: inputs.buildID, part: inputs.newPartId, slot: inputs.slotID});
          

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
          offstageIndex: inputs.offstageIndex,
          clearSlotList: clearSlotList,
          tourMode: inputs.tourMode,
        });

      }
    }
    
    
    // All done.
    return;

  }


};
