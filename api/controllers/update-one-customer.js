module.exports = {


  friendlyName: 'Update one customer',


  description: '',


  inputs: {
    id:{
      type:'number',
     required: true,
    },
    companyName:{
      type: "string",
     required: true,
      
    },
    contactName:{
      type:"string",
     required: true,
      
    },
    contactEmail:{
      type: "string",
     required: true,
 
    },
  },


  exits: {

  },


  fn: async function (inputs) {
    sails.log("HIT THE UPDATE customer ACTION");

    await Customers.update({id:inputs.id})
    .set({
      companyName : inputs.companyName,
      contactName : inputs.contactName,
      contactEmail: inputs.contactEmail
    });
    // All done.
    return;

  }


};
