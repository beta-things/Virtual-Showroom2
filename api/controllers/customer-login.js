module.exports = {


  friendlyName: 'Customer login',


  description: '',


  inputs: {
    contactEmail: {
      required: true,
      type: 'string',
      description: 'The email address for the new Customer',
      extendedDescription: 'Must be a valid email address.',
    },
    sessionCode: {
      required: true,
      type: 'string',
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    var error = {error: "none"};
    var foundCustomer = await Customers.findOne({contactEmail : inputs.contactEmail}).populate('builds');
    if(foundCustomer){
      if(foundCustomer.builds.length > 0){
        for(i=0; i<foundCustomer.builds.length; i++){
          if(foundCustomer.builds[i].sessionCode == inputs.sessionCode){
            return {error:'none', customerID:foundCustomer.id, sessionCode : foundCustomer.builds[i].sessionCode}
          }else{
            sails.log("customer with no session matching");
            error= {error:"Invalid session. Please consult your sales agent."};
          }
        }
      }else{
        sails.log("no builds for cuustomer");
        error={error:"Your sales agent has not created a session for you."};
      }
    }else{
      sails.log("no customer");
      error = {error:"Invalid session. Please consult your sales agent."};
    }
    //sails.log(foundCustomer);
    // All done.
    return error

  }


};
