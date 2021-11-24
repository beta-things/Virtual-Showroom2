module.exports = {


  friendlyName: 'Populate slot parts',


  description: '',


  inputs: {
    sessionCode:{
      type: "string",
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {

    //GET THE BUILD WITH IT'S BUILD PARTS
    var build = await Builds.findOne({sessionCode:inputs.sessionCode}).populate('owner').populate('buildParts');

    //needs a way to step through the slots in slot order
    //looks like there is no way for the order of slot IDs to be out of sequence with the order of slot positions
    //thus we will default to order by id

    //add part info to build parts object
    for(i=0; i<build.buildParts.length; i++){
      var partID = build.buildParts[i].part;
      var partInfo = await Parts.findOne({id:partID });
      build.buildParts[i].partInfo = partInfo; 
    }

    //get the template with it's slots
    var templateWithSlots = await Templates.findOne({id:build.template}).populate('slots');

    //for every slot, add parts
    for(var i=0; i<templateWithSlots.slots.length; i++){
      //add the posOffObserve to the slot level
       var foundSlot = await Slot.findOne({id : templateWithSlots.slots[i].id}).populate('posOffObserve');
       templateWithSlots.slots[i].posOffObserve = foundSlot.posOffObserve;


      var ownerSlotId = templateWithSlots.slots[i].id;
      //adding in the parts for each slot
      var slotParts = await Parts.find({owner:ownerSlotId});
      //for each part in slot
      for(var v=0; v<slotParts.length; v++){
        //is the part an aliace or does it have aliaces

        //case: this part is an aliace
        if(slotParts[v].isAliasPart){
          //build has part ID
          var whenBuildHasPartID = slotParts[v].hasPartID;
          //which part is this an aliace of?
          var aliaceOfPartID = slotParts[v].aliasOfPartID;

          //are conditions met that this aliace part is available for use to select? 
          //Does build have the 'use when' part ID. Requires check of build.buildParts 
          if( _.find(build.buildParts, {part: whenBuildHasPartID}) ){
            //set aliace's original part to NOT display
            var notDisplayedIndex = _.findIndex(slotParts, { 'id': aliaceOfPartID });
            slotParts[notDisplayedIndex].doNotDisplay = true;
          }else{//set this part to not display
            slotParts[v].doNotDisplay = true;
          }
        }
   
          //if part exists in buildparts, set the active flag
          var foundBuildPart =  _.find(build.buildParts, {part: slotParts[v].id});
          //set an active flag based on searching the Buildparts model
          if(foundBuildPart){//true, so part is in the build
            slotParts[v].active = true;
            slotParts[v].price = foundBuildPart.price;
            slotParts[v].friendlyName = slotParts[v].friendlyName;
          }else{//false so part is only showing up from the template 
            slotParts[v].active = false;
            slotParts[v].price = 0.00;
            slotParts[v].friendlyName = slotParts[v].friendlyName;
          }
      }
      
      templateWithSlots.slots[i].parts = slotParts;
      
    }
    return{
      build:build,
      templateWithSlots: templateWithSlots
    }

  }


};

