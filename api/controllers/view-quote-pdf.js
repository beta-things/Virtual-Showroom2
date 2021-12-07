module.exports = {


  friendlyName: 'View quote pdf',


  description: 'Display "Quote pdf" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/quote-pdf'
    },

    redirect: {
      responseType: 'redirect',
      description: 'Either the sales agent is not logged in or the attacker is trying a bad combo of buildSecret and session code'
    },

  },


  fn: async function () {

    //are we a logged in agent?
    if(!this.req.me){
      
      //kick also if missing session code or buildSecret
      if(!this.req.params.sessionCode || !this.req.params.buildSecret){
        throw {redirect:'/'}; //EXIT
      }

      //check that the session exists and that the secret is it's creation TS
      var buildInfo = await Builds.findOne({sessionCode: this.req.params.sessionCode});
      if(buildInfo){
        if(buildInfo.createdAt != this.req.params.buildSecret){
          //secret does not match session
          throw {redirect:'/'}; //EXIT
        }
        //passing to here is the only route in as a non-admin
      }else{
        //there is no such session
        throw {redirect:'/'}; //EXIT
      }

    }else{
      //we still need to know if the session exists 
      var buildInfo = await Builds.findOne({sessionCode: this.req.params.sessionCode});
      if(!buildInfo){
        throw {redirect:'/'}; //EXIT
      }
    }


    //POPULATE-SLOT-PARTS HELPER also returns build object
    var helper_return = await sails.helpers.populateSlotParts.with({
      sessionCode:this.req.params.sessionCode, 
    });

    var templateWithSlots = helper_return.templateWithSlots;
    var build = helper_return.build;

    //get additional quote line items and inject them into the build object
    var additionalLineItems = await QuoteLineItems.find({AssociatedBuild: build.id}).sort('id ASC');
    build.additionalLineItems = additionalLineItems;

    // Respond with view.
    return {
      templateWithSlots: templateWithSlots,
      build: build,
    };

  }


};
