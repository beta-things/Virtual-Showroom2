module.exports = {


  friendlyName: 'Destroy one user',


  description: 'Allow super admin to delete one user by ID',


  inputs: {
    id:{
      type: 'number',
      required: true
    }
  },


  exits: {
    forbidden:{
      description: 'user is not superAdmin',
      responseType: 'forbidden'
    }
  },


  fn: async function (inputs) {
    var the_user = await User.findOne({
      id: this.req.me.id
    })
    if(the_user.isSuperAdmin == true){
      await User.destroy({id: inputs.id});
    }else{
      throw 'forbidden';
    }
    // All done.
    return;

  }


};
