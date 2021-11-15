module.exports = {


  friendlyName: 'New customer',


  description: 'allow any logged in sales agent to generate a new customer for themselves',


  inputs: {
    contactEmail: {
      required: true,
      type: 'string',
      isEmail: true,
      description: 'The email address for the new Customer',
      extendedDescription: 'Must be a valid email address.',
    },
    contactName: {
      required: true,
      type: 'string',
    },
    companyName: {
      required: true,
      type: 'string',  
    },
  },


  exits: {

  },


  fn: async function (inputs) {
    await Customers.create({contactEmail: inputs.contactEmail, contactName: inputs.contactName, companyName: inputs.companyName, owner:this.req.me.id});
    sails.log("created new customer");
    // All done.
    return;

  }


};
