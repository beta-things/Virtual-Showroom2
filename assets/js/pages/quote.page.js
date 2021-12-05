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
    cacheBuster: undefined
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

    updateTotalPrice: function(index){
      if(index != undefined){
        this.build.buildParts[index].price = parseFloat(this.build.buildParts[index].vuPrice); //update is being called so we know we are focused. therefore the value in vuPrice will be unformatted
      }
      this.priceTotal = 0;
      for(var i = 0; i<this.build.buildParts.length; i++){
        var partPrice = this.build.buildParts[i].price;
        var mathEnt = parseFloat(partPrice);
        this.priceTotal += mathEnt;
        
      }
      this.priceTotal = Math.round(this.priceTotal * 100) / 100;

      this.priceTotal = this.priceTotal.toLocaleString();
  
    },

    pricesToDisplay: function(){
      for(var i = 0; i<this.build.buildParts.length; i++){
        this.build.buildParts[i].vuPrice = this.build.buildParts[i].price.toLocaleString();
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

    

    newQuoteLineItem: function(){
     //add to quoteLineItems therefore increasing the number of extra line item forms on the page
     this.quoteLineItems.push({partCode:undefined, friendlyName: undefined, partDescription: undefined});
    }

  }
  
});
