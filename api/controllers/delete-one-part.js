module.exports = {


  friendlyName: 'Delete one part',


  description: '',


  inputs: {
    id:{
      type:"number",
      required: true,
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    await Parts.destroy({id:inputs.id});
    // All done.
    return;

  }


};
