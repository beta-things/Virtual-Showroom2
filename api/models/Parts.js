/**
 * Parts.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
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
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    owner:{
      model: "slot",
      
    },

  },

};

