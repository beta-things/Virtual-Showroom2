parasails.registerPage('edit-template', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    newSlots:[],
    newSlotName:undefined,
    newSlotAllowEmpty:"no",
    newSlotNonLineItem: "no",
    templateName:undefined,
    templatesList:undefined,
    meshFileName: undefined,
    newSlotOffsetObservances: [],
    
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    //…
  },
  mounted: async function() {
    console.log(this.templatesList);
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    addSlotVue : function() {
      if(this.newSlotName){
        
        var nonLineItemBool = undefined;
        if(this.newSlotNonLineItem == "no"){
          nonLineItemBool=false;
        }else{
          nonLineItemBool=true;
        }
        console.log();

        this.newSlots.push({name:this.newSlotName, nonLineItem: nonLineItemBool, offsetObservances: this.newSlotOffsetObservances });
      }
      
      this.newSlotName=undefined;
      this.newSlotOffsetObservances = [];
    },

    removeSlot: function(slotIndex){
      console.log("to remove "+slotIndex);
      this.newSlots.splice(slotIndex,1)
    },

    addTemplate : async function(){
      if(this.templateName){
        var jsonSlots = JSON.stringify(this.newSlots);
        this.templatesList = await Cloud.addNewTemplate.with({
                                                              templateName:this.templateName, 
                                                              meshFileName: this.meshFileName, 
                                                              slots:jsonSlots
                                                            });
        this.newSlotName=undefined;
        this.newSlots=[];
        this.templateName=[];
      }
    },
    setActiveTemplate: async function(templateID){
      console.log("setting ID to active "+templateID);
      this.templatesList = await Cloud.setActiveTemplate.with({newActiveTemplateID: templateID});

    },

  }
});
