module.exports = {


  friendlyName: 'Update one salesperson',


  description: 'action for updating a user record by superadmin',


  inputs: {
    id:{
      type:'number',
      required: true,
    },
    fullName:{
      type: 'string',
      required: true,
    },
    emailAddress:{
      type: 'string',
      required: true,
    }, 
  },


  exits: {

  },


  fn: async function (inputs) {
    sails.log("HIT THE UPDATE ONE SAILSPERSON ACTION");
    await User.update({id:inputs.id})
    .set({
      fullName:inputs.fullName,
      emailAddress:inputs.emailAddress
    })
    // All done.
    return;

  }


};
