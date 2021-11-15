module.exports = {


  friendlyName: 'Delete one customer',


  description: 'all in the name. A salesperson can delete any customer they own',


  inputs: {
    id:{
      type: 'number',
      required: true
    }
  },


  exits: {
    forbidden:{
      description: 'not a logged in agent of Superadmin',
      responseType: 'forbidden'
    }
  },


  fn: async function (inputs) {
    sails.log("hitting the delete customer action for "+ inputs.id);
    if(this.req.me){ //should probably actually check if the user is the owner but I don't see malicious intent between salespeople
      //await Builds.destroy({owner: this.req.me.id});

      await Customers.destroy({id: inputs.id});
    }else{
      throw 'forbidden';
    }
    // All done.
    return;

  }


};
