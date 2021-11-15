module.exports = {


  friendlyName: 'Delete one build',


  description: ' Allows the sales agent owner of a given build to delete it',


  inputs: {
    id:{
      type: 'number',
      required: true
    },
    customerID:{
      type: 'number',
      required: true
    }
  },


  exits: {
    forbidden:{
      description: 'salesperson does not own record',
      responseType: 'forbidden'
    }
  },


  fn: async function (inputs) {

    var the_customer = await Customers.findOne({id:inputs.customerID });
    var the_build = await Builds.findOne({id:inputs.id}).populate('buildParts');
    
    if(the_customer.owner !=  this.req.me.id ){
      throw 'forbidden';
    }

    if(the_build.owner !=  inputs.customerID ){
      throw 'forbidden';
    }

    for(i=0; i<the_build.buildParts.length; i++){
      var bPart = the_build.buildParts[i];
      await Buildparts.destroy({id: bPart.id});
    }

    await the_build.buildParts.forEach(bPart => {
      Buildparts.destroy({id: bPart.id});  
    });
    
    await Builds.destroy({id: inputs.id});
    // All done.
    return;

  }


};
