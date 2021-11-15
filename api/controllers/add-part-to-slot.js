module.exports = {


  friendlyName: 'Add part to slot',


  description: 'for admin to add a part to the pool of selectable parts for a given slot id',


  inputs: {

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
    aliasWhenSlotID:{
      type:"number",
      defaultsTo: undefined,
    },
    hasPartID:{
      type:"number",
      defaultsTo: undefined,
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
    hasPreReq:{
      type: "boolean",
      defaultsTo: false
    },
    preReqPartID:{
      type: "number",
    }

  },


  exits: {

  },


  fn: async function (inputs) {
    var newRecord = await Parts.create({
      friendlyName : inputs.friendlyName, 
      meshName : inputs.meshName,  
      isAliasPart : inputs.isAliasPart,
      aliasRefName: inputs.aliasRefName,
      aliasOfPartID:inputs.aliasOfPartID, 
      aliasWhenSlotID: inputs.aliasWhenSlotID,
      hasPartID:inputs.hasPartID,
      downstreamXOffset : inputs.downstreamXOffset,
      downstreamYOffset : inputs.downstreamYOffset,
      downstreamZOffset : inputs.downstreamZOffset,
      owner : inputs.optionForSlotID,
      partCode: inputs.partCode,
      partDescription: inputs.partDescription,
      hasPreReq: inputs.hasPreReq,
      preReqPartID: inputs.preReqPartID,
    }).fetch();

    sails.log(newRecord);

    var allPartsForSlot = await Parts.find({owner:inputs.optionForSlotID});
    // All done.
    return allPartsForSlot;

  }


};
