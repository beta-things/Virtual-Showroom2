module.exports = {


  friendlyName: 'View showroom',


  description: 'Display "Showroom" page.',

  exits: {

    success: {
      
      viewTemplatePath: 'pages/showroom',
      
    },

    redirect: {
      responseType: 'redirect',
      description: 'Either the sales agent is not logged in or the attacker is trying a bad combo of ID and session code'
    },

  },


  fn: async function () {
    //if we don't have a session code, kick them out
    if(!this.req.params.sessionCode){
      throw {redirect:'/'}; //EXIT
    }
    
    //if there is no sales agent cookie and no customer id, kick them out
    if(!this.req.params.customerID && !this.req.me){
      throw {redirect:'/'}; //EXIT
    } 

    //POPULATE-SLOT-PARTS HELPER also returns build object
    var helper_return = await sails.helpers.populateSlotParts.with({
      sessionCode:this.req.params.sessionCode, 
    });
    var templateWithSlots = helper_return.templateWithSlots;
    var build = helper_return.build;

    if(!this.req.me){//case: customer id present but no sales agent session
      if(build.owner.id == this.req.params.customerID){ //does session code belong to the user?
        sails.log("passed validation where no sales agent cookie found");
      }else{
        throw {redirect:'/'};//EXIT
      }
    }else{//there is a sales agent session active
      sails.log("passed validation where sales agent can see whatever they want");
    }
    // now we either we have a logged in sales agent (who can see whatever they want) or we have a user ID to check for ownership

    //get customer info for front end
    var client = build.owner;
    //get sales agent info for front end
    var agentID = build.owner.owner;//the build's owner is the client and the client's owner is the sales agent. thus owner.owner
    var salesAgent = await User.findOne({id:agentID});
    var isLoggedAgent = false;
    if(this.req.me){
      isLoggedAgent = true;
    }
    
    return {
            client:client,
            salesAgent: salesAgent,  
            build: build,
            isLoggedInAgent: isLoggedAgent,
            templateWithSlots: templateWithSlots
          };

  }


};
