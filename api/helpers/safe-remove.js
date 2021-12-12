module.exports = {


  friendlyName: 'Safe remove',


  description: 'this helper will take a slotID and buildID and remove parts in slots that reference its offsets RETURN a list of slot indecies removed for the front end',


  inputs: {

    slotID:{
      type: "number",
      required: true,
    },

    AssociatedBuild:{
      type: "number",
      required: true,
    }


  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {

    //find the template that owns this slot
    var calledSlot = await Slot.findOne({id: inputs.slotID});
    var template = {id: calledSlot.owner};
    

    //find all the slots owned by this template 
    var allTemplateSlots = await Slot.find({owner: template.id}).populate('posOffObserve');
    var clearSlots = [];
    var clearSlotsID = [];



    for(var i=0; i<allTemplateSlots.length; i++){
      var currentSlot = allTemplateSlots[i];
      for(var v=0; v<currentSlot.posOffObserve.length; v++){//go though each observance for this slot
        var thisObservance = currentSlot.posOffObserve[v].stackPosition;
        if(thisObservance == calledSlot.stackPosition){//if the currentSlot has an observance pointing to the inputted slotindex
          if(!clearSlots.includes(currentSlot.stackPosition)){//if clearSlots does not already have this value
            clearSlots.push(currentSlot.stackPosition);//add this stack pos to the front end remove list
            clearSlotsID.push(currentSlot.id);
            sails.log("adding slot indext to attay");
          }else{
            sails.log("slot index already in attay");
          }
        }
        
      }
    }
    
    //for each above this slot, delete from Buildparts
    for(i=0; i<clearSlotsID.length; i++){
      //get the build slotID to destroy the build part that references it
      await Buildparts.destroy({slot: clearSlotsID[i], AssociatedBuild: inputs.AssociatedBuild});
    }
    //remove the part that was actually called.
    await Buildparts.destroy({slot: inputs.slotID, AssociatedBuild: inputs.AssociatedBuild});

    return clearSlots;

  }


};

