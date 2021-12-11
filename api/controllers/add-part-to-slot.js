module.exports = {


  friendlyName: 'Add part to slot or update',


  description: 'for admin to add a part to the pool of selectable parts for a given slot id',


  inputs: {

    update:{
      type: "boolean",
      defaultsTo: false,
    },

    updatePartID: {
      type: "number",

    },

    friendlyName:{
      type: "string",
      required: true,
      example: "PTZ Pedastle"
    },
    partCode:{
      type:"string",
      defaultsTo: "XXX"
    },
    partDescription:{
      type: "string",
      defaultsTo: "Inquire with sales agent."
    },
    meshName:{
      type: "string",
      required: true,
      example: "ptz_ped_0450"
    },
    optionForSlotID:{
      type: "number",
      required: true
    },
    isAliasPart:{
      type: "boolean",
      defaultsTo: false
    },
    aliasRefName:{
      type: "string",
      defaultsTo: undefined
    },
    aliasOfPartID:{
      type:"number",
      defaultsTo: undefined,
    },
    aliasTrunks:{
      type: "json", //is an array of objects
      defaultsTo: undefined
    },
    downstreamXOffset:{
      type: "number",
      defaultsTo: 0
    },
    downstreamYOffset:{
      type: "number",
      defaultsTo: 0
    },
    downstreamZOffset:{
      type: "number",
      defaultsTo: 0
    },


  },


  exits: {

  },


  fn: async function (inputs) {

    if(inputs.update){

      await Parts.update({id:inputs.updatePartID}).set({
        friendlyName : inputs.friendlyName, 
        meshName : inputs.meshName,  
        isAliasPart : inputs.isAliasPart,
        aliasRefName: inputs.aliasRefName,
        aliasOfPartID:inputs.aliasOfPartID, 
        downstreamXOffset : inputs.downstreamXOffset,
        downstreamYOffset : inputs.downstreamYOffset,
        downstreamZOffset : inputs.downstreamZOffset,
        owner : inputs.optionForSlotID,
        partCode: inputs.partCode,
        partDescription: inputs.partDescription,
      });
      //delete existing alias trunks for this part ID
      await AliasTrunks.destroy({owner:inputs.updatePartID});

      //re-make all the alias trunks
      for(var i=0; i<inputs.aliasTrunks.length; i++){
        await AliasTrunks.create({ //make new alias trunk and assign it to the new part
          aliasWhenSlotID:inputs.aliasTrunks[i].slot.id ,
          hasPartID: inputs.aliasTrunks[i].part.id,
          owner: inputs.updatePartID,
        });
      }

      var newRecord = {id:inputs.updatePartID};
      
    }else{

      var newRecord = await Parts.create({
        friendlyName : inputs.friendlyName, 
        meshName : inputs.meshName,  
        isAliasPart : inputs.isAliasPart,
        aliasRefName: inputs.aliasRefName,
        aliasOfPartID:inputs.aliasOfPartID, 
        downstreamXOffset : inputs.downstreamXOffset,
        downstreamYOffset : inputs.downstreamYOffset,
        downstreamZOffset : inputs.downstreamZOffset,
        owner : inputs.optionForSlotID,
        partCode: inputs.partCode,
        partDescription: inputs.partDescription,
      }).fetch();

      for(var i=0; i<inputs.aliasTrunks.length; i++){
        await AliasTrunks.create({ //make new alias trunk and assign it to the new part
          aliasWhenSlotID:inputs.aliasTrunks[i].slot.id ,
          hasPartID: inputs.aliasTrunks[i].part.id,
          owner: newRecord.id,
        });
      }

    }


   

    var allPartsForSlot = await Parts.find({owner:inputs.optionForSlotID}).populate('aliasTrunks');
   
    
    for(p=0; p<allPartsForSlot.length; p++){ //for each part 
      for(t=0; t<allPartsForSlot[p].aliasTrunks.length; t++){ //for each trunk
        var trunk = allPartsForSlot[p].aliasTrunks[t];
        allPartsForSlot[p].aliasTrunks[t].slot = {};
        allPartsForSlot[p].aliasTrunks[t].slot.id = trunk.aliasWhenSlotID;
        var slot = await Slot.findOne({id: trunk.aliasWhenSlotID});
        allPartsForSlot[p].aliasTrunks[t].slot.slotName = slot.slotName;

        allPartsForSlot[p].aliasTrunks[t].part = {};
        allPartsForSlot[p].aliasTrunks[t].part.id = trunk.hasPartID;
        var part = await Parts.findOne({id: trunk.hasPartID});
        allPartsForSlot[p].aliasTrunks[t].part.friendlyName = part.friendlyName;
      }
    }


    // All done.
    return {
        allPartsForSlot: allPartsForSlot ,
        newPartID: newRecord.id,
    };

  }


};
