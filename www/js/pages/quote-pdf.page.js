parasails.registerPage('quote-pdf', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    build: undefined,
    templateWithSlots: undefined,
    salesAgent: undefined,
    priceTotal : 0,
    baseUrl: undefined,
    dateOutput: undefined,
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    this.cacheBuster = Date.now();
  },
  mounted: async function() {
    
    this.pricesToDisplay();
    this.updateTotalPrice();
    //this.build.buildParts.reverse();

    var lastEdit = this.build.updatedAt;
    var date = new Date(lastEdit);

    this.dateOutput = date.getDate()+
          "/"+(date.getMonth()+1)+
          "/"+date.getFullYear();
    
     

  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    
    updateTotalPrice: function(index, buildPart=true){
      
      if(buildPart){//is this a build part thing
        if(index != undefined){
          var formInputToFloat = parseFloat(this.build.buildParts[index].vuPrice); //update is being called so we know we are focused. therefore the value in vuPrice will be unformatted
          if(!Number.isNaN(formInputToFloat)){  
            this.build.buildParts[index].price = formInputToFloat; 
          }else{
            this.build.buildParts[index].vuPrice = 0;
          }
        }
      }else{//this is an additional line item thing
        if(index != undefined){
          var formInputToFloat = parseFloat(this.build.additionalLineItems[index].vuPrice); //update is being called so we know we are focused. therefore the value in vuPrice will be unformatted
          if(!Number.isNaN(formInputToFloat)){  
            this.build.additionalLineItems[index].price = formInputToFloat; 
          }else{
            this.build.additionalLineItems[index].vuPrice = 0;
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

  }
});
