module.exports = {


  friendlyName: 'Add update quote item',


  description: 'when given the Quote Line Items ID and one or more attributes, it updates the line item or if called fresh it returns the new ID',


  inputs: {
    buildID: {
      type:"number",
      required: true,
    },

    quoteLineItemID:{
      type:"number",
    },

    partCode:{
      type:"string",
    
    },
   
    friendlyName:{
      type: "string",
     
    },

    partDescription:{
      type: "string",
      
    },
   
    price:{
      type: "number",
    },

    deleteItem:{
      type: "number",
    }
    

  },


  exits: {

  },


  fn: async function (inputs) {

    if(inputs.deleteItem){
      await QuoteLineItems.destroy({id: inputs.deleteItem});
      return;
    }

    //if no line item ID given, we create a new entry and return it's ID
    if(!inputs.quoteLineItemID){
      var newItem = await QuoteLineItems.create({AssociatedBuild: inputs.buildID}).fetch();
      return newItem.id;

    }else{ //else require ID 
      //update record with given values 
      await QuoteLineItems.update({id: inputs.quoteLineItemID}).
      set({
        friendlyName: inputs.friendlyName,
        price: inputs.price,
        partCode: inputs.partCode,    
        partDescription: inputs.partDescription,
      });

    }

    // All done.
    return;

  }


};
