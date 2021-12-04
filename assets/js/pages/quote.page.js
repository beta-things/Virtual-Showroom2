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
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    //…
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
      if(index){
        this.build.buildParts[index].price = parseFloat(this.build.buildParts[index].vuPrice);
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
      console.log("focus price");
      console.log(this.build.buildParts[index].vuPrice);
      console.log(this.build.buildParts[index].price);
      this.build.buildParts[index].vuPrice = this.build.buildParts[index].price; 
      this.$forceUpdate();
    },
    
    blurPrice: function(index){
      console.log("blur price");
      this.pricesToDisplay();
      
    },

    

    newQuoteLineItem: function(){
     //add to quoteLineItems therefore increasing the number of extra line item forms on the page
     this.quoteLineItems.push({partCode:undefined, friendlyName: undefined, partDescription: undefined});
    }

  }
  
});
