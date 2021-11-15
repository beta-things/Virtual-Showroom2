module.exports = {


  friendlyName: 'Build notes',


  description: 'allows admin to update notes value or sends the notes data to a customer who provides their ID and session code ',


  inputs: {
    sessionCode:{
      type:"string",
      example:"XAE89Q",
      defaultsTo: undefined
    },
    customerId:{
      type: "number",
      defaultsTo: undefined
    },
    buildID:{
      type: "number",
      defaultsTo: undefined
    },
    buildNotes:{
      type: "string",
      defaultsTo: undefined,
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    var notes = undefined;
    //if request comes from sales agent 
   
    if(this.req.me){
      //and if the request has a specific build and notes to update
      if(inputs.buildNotes && inputs.buildID){
        //update the build with given ID to have given notes
        await Builds.update({id:inputs.buildID}).set({buildNotes: inputs.buildNotes});
        notes = inputs.buildNotes;
        sails.sockets.join(this.req, inputs.sessionCode);
        sails.sockets.broadcast(inputs.sessionCode, 'notes-change', notes);

      }else{
        var build = await Builds.findOne({id:inputs.buildID});
        notes = build.buildNotes;
      }
      
    }else{
      if(inputs.sessionCode && inputs.customerId){
        //not logged in agent so must prove that the build session code belongs to customer id
        var build = await Builds.findOne({sessionCode:inputs.sessionCode}).populate('owner');
        if(build.owner.id == inputs.customerId){
          notes = build.buildNotes;
          sails.log('customer joined session: '+inputs.sessionCode);
          sails.sockets.join(this.req, inputs.sessionCode);
          
        }
      }else{
        notes = "farrrt";
        sails.log(inputs.sessionCode);
        sails.log(inputs.customerId);
      }

    }
    // All done.
    return notes;

  }


};
