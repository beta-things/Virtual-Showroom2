module.exports = {


  friendlyName: 'Meeting participants',


  description: 'Controller provides api access to the front end sockets.',


  inputs: {
    sessionCode: {
      type:"string",
      example:"XR5TQ"
    },
    isAdmin: {
      type: "boolean"
    },
    isResponse:{
      type: "boolean",
      defaultsTo: false
    },
    makeLogout:{
      type: "boolean",
      defaultsTo: false
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    sails.sockets.join(this.req, inputs.sessionCode);
    
    if(inputs.isResponse){
      //broadcasts message saying that we are online but not to reply to this one 
      //AVOID PING PONG MATCH
      sails.sockets.broadcast(inputs.sessionCode, 'im-here', {isAdmin:inputs.isAdmin, isResponse:inputs.isResponse, makeLogout: inputs.makeLogout});
    }else{
      //this is the on load / MOUNTED call. it will require response from partners
      sails.sockets.broadcast(inputs.sessionCode, 'im-here', {isAdmin:inputs.isAdmin, makeLogout: inputs.makeLogout});
    }
    
    
    
    // All done.
    return;

  }


};
