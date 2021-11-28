module.exports = {


  friendlyName: 'View quote',


  description: 'Display "Quote" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/quote'
    }

  },


  fn: async function () {

    if(!this.req.params.sessionCode){
      throw {redirect:'/admin'}; //EXIT
    }

    //POPULATE-SLOT-PARTS HELPER also returns build object
    var helper_return = await sails.helpers.populateSlotParts.with({
      sessionCode:this.req.params.sessionCode, 
    });

    var templateWithSlots = helper_return.templateWithSlots;
    var build = helper_return.build;

    // Respond with view.
    return {
      templateWithSlots: templateWithSlots,
      build: build,
    };

  }


};
