module.exports = {


  friendlyName: 'Update quote price',


  description: 'update a single build part price ',


  inputs: {

    buildPartId:{
      type: "number"
    },
    price:{
      type: "number"
    }

  },


  exits: {

  },


  fn: async function (inputs) {

    await Buildparts.update({id : inputs.buildPartId})
    .set({
      price : inputs.price,
    });

    // All done.
    return;

  }


};
