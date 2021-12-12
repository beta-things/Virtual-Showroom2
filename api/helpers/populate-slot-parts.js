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

    var customer = await Customers.findOne({id: build.owner.id}).populate('owner');

    var salesAgent = customer.owner;

    //needs a way to step through the slots in slot order
    //looks like there is no way for the order of slot IDs to be out of sequence with the order of slot positions
    //thus we will default to order by id

    //add part info to build parts object
    for(i=0; i<build.buildParts.length; i++){
      var partID = build.buildParts[i].part;
      var partInfo = await Parts.findOne({id:partID }).populate('aliasTrunks');
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
        
        //is the part an alias
        if(slotParts[v].isAliasPart){
          //get all the alias trunks for this part
          var aliasTrunks = await AliasTrunks.find({owner : slotParts[v].id });
          //loop through the alias trunks to see if any take effect. 
          var trunkHits = 0;
          for(var t=0; t<aliasTrunks.length; t++){
            var aliaceOfPartID = slotParts[v].aliasOfPartID; //which part is this an aliace of?
            var whenBuildHasPartID = aliasTrunks[t].hasPartID; //build has part ID
            //are conditions met that this aliace part is available for use to select? 
            //find any matches between build part ids and any of the alias trunk hasPartIDs
            if( _.find(build.buildParts, {part: whenBuildHasPartID}) ){
              trunkHits +=1;
            }
          }

          if(trunkHits>0){//if matches found, then doNotDisplay this part's originator
            var originatorPartIndex = _.findIndex(slotParts, { 'id': aliaceOfPartID });
            slotParts[originatorPartIndex].doNotDisplay = true;
          }else{//else do not display this part
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
      templateWithSlots: templateWithSlots,
      salesAgent: salesAgent
    }

  }


};

