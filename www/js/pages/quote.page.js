parasails.registerPage('quote', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    //…
    templateWithSlots: undefined,
    build: undefined,
    loadingBuild: false,
    priceTotal : 0,
    quoteLineItems: [],
    cacheBuster: undefined,
    loadingDelete: false,
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    this.cacheBuster = Date.now();
  },
  mounted: async function() {
    //…
    this.pricesToDisplay();
    this.updateTotalPrice();

  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    redirectToBuild: function(sessionCode){
      this.loadingBuild = true;
      window.location.replace("/showroom/"+sessionCode);
    },

    updateTotalPrice: function(index, buildPart=true){
      
      if(buildPart){
        if(index != undefined){
          var formInputToFloat = parseFloat(this.build.buildParts[index].vuPrice); //update is being called so we know we are focused. therefore the value in vuPrice will be unformatted
          if(!Number.isNaN(formInputToFloat)){  
            this.build.buildParts[index].price = formInputToFloat; 
          }else{
            this.build.buildParts[index].vuPrice = 0;
          }
        }
      }else{
        if(index != undefined){
          var formInputToFloat = parseFloat(this.build.additionalLineItems[index].vuPrice); //update is being called so we know we are focused. therefore the value in vuPrice will be unformatted
          if(!Number.isNaN(formInputToFloat)){  
            this.build.buildParts[index].price = formInputToFloat; 
          }else{
            this.build.buildParts[index].vuPrice = 0;
          }
        }
      }

      this.priceTotal = 0;
      for(var i = 0; i<this.build.buildParts.length; i++){//BUID PARTS
        var partPrice = this.build.buildParts[i].price;
        var mathEnt = parseFloat(partPrice);
        this.priceTotal += mathEnt;
      }

      for(var i = 0; i<this.build.additionalLineItems.length; i++){//ADDITIONAL LINE ITEMS
        var partPrice = this.build.additionalLineItems[i].price;
        var mathEnt = parseFloat(partPrice);
        this.priceTotal += mathEnt;
      }

      this.priceTotal = Math.round(this.priceTotal * 100) / 100;

      this.priceTotal = this.priceTotal.toLocaleString();
      this.$forceUpdate();
    },

    pricesToDisplay: function(){ //converts the holding value of the price to a display ready version then stores it in vuPrice
      for(var i = 0; i<this.build.buildParts.length; i++){
        this.build.buildParts[i].vuPrice = this.build.buildParts[i].price.toLocaleString();
      }
      for(var i = 0; i<this.build.additionalLineItems.length; i++){
        this.build.additionalLineItems[i].vuPrice = this.build.additionalLineItems[i].price.toLocaleString();
      }
      this.$forceUpdate();
    },

    focusPrice: function(index){
      if(this.build.buildParts[index].price == 0){
        this.build.buildParts[index].vuPrice = "";
      }else{
        this.build.buildParts[index].vuPrice = this.build.buildParts[index].price;   
      }
      this.$forceUpdate();
    },
    
    blurPrice: async function(index){
      //send new price to db
      var bPartDBID = this.build.buildParts[index].id;
      var newPrice = this.build.buildParts[index].price;
      
      this.pricesToDisplay();

      await Cloud.updateQuotePrice.with({buildPartId: bPartDBID, price:newPrice});
      
    },

    newQuoteLineItem: async function(){
      //ping the DB for a new quoteLineItem ID
      var newQuoteLineItemID =  await Cloud.addUpdateQuoteItem.with({buildID: this.build.id});
      this.build.additionalLineItems.push({id : newQuoteLineItemID, price: 0, vuPrice:"0"});
      //add to quoteLineItems therefore increasing the number of extra line item forms on the page
      //this.quoteLineItems.push({id: newQuoteLineItemID, partCode: undefined, friendlyName: undefined, partDescription: undefined});
    },

    deleteQuoteLineItem: async function(itemID, itemIndex){
      this.loadingDelete = true;
      await Cloud.addUpdateQuoteItem.with({deleteItem: itemID, buildID: this.build.id});
      this.build.additionalLineItems.splice(itemIndex, 1);
      this.loadingDelete = false;
    },

    blurAdditionItem: async function(itemIndex){

      var buildID = this.build.id;
      var quoteLineItemID = this.build.additionalLineItems[itemIndex].id;
      var partCode = this.build.additionalLineItems[itemIndex].partCode;
      var friendlyName = this.build.additionalLineItems[itemIndex].friendlyName;
      var partDescription = this.build.additionalLineItems[itemIndex].partDescription;
      var price = this.build.additionalLineItems[itemIndex].vuPrice;

      await Cloud.addUpdateQuoteItem.with({
        buildID: buildID,
        quoteLineItemID: quoteLineItemID,
        partCode: partCode,
        friendlyName: friendlyName,
        partDescription: partDescription,
        price: price,
        });
      
    }

  }
  
});
