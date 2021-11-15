parasails.registerPage('edit-parts', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    //globals
    selectedTemplateIndex: 0,
    templatesList: undefined,
    
    //FORM elements per slot basis 
    isAlias: [],
    aliasOfPartID: [],
    useAliasWhenSlot: [],
    whenSlotHasPartID: [],
    xOffset:[],
    yOffset:[],
    zOffset:[],
    meshName:[],
    displayName:[],
    aliasRefName:[],
    partCode:[],
    partDescription:[],
    hasPreReq: [],
    preReqPart: [],

    //INTERPOLATED VALUES
    AliasPartSlotIndex:undefined,
    
    allCurrentParts: [],

  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    //…
  },
  mounted: async function() {
    this.stripOutPartsOfActive();
    console.log(this.allCurrentParts);
     
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    createPart: async function(slotIndex){
        console.log("adding "+this.displayName[slotIndex]+" mesh name "+ this.meshName[slotIndex]+
        " to slot id "+ this.templatesList[this.selectedTemplateIndex].slots[slotIndex].id);

        var slotID = this.templatesList[this.selectedTemplateIndex].slots[slotIndex].id;

        var allPartsForSlot = await Cloud.addPartToSlot.with({
          friendlyName:this.displayName[slotIndex], 
          meshName: this.meshName[slotIndex],
          optionForSlotID: slotID,
          isAliasPart: this.isAlias[slotIndex],
          aliasRefName: this.aliasRefName[slotIndex],
          aliasOfPartID:this.aliasOfPartID[slotIndex],
          aliasWhenSlotID: this.useAliasWhenSlot[slotIndex],
          hasPartID:this.whenSlotHasPartID[slotIndex],
          downstreamXOffset : this.xOffset[slotIndex],
          downstreamYOffset : this.yOffset[slotIndex],
          downstreamZOffset : this.zOffset[slotIndex],
          partCode : this.partCode[slotIndex],
          partDescription: this.partDescription[slotIndex],
          hasPreReq: this.hasPreReq[slotIndex],
          preReqPartID: this.preReqPart[slotIndex],
         
        });

        //reset form
        this.displayName[slotIndex] = undefined;
        this.meshName[slotIndex] = undefined;
        this.xOffset[slotIndex] = undefined;
        this.yOffset[slotIndex] = undefined;
        this.zOffset[slotIndex] = undefined;
        this.aliasRefName[slotIndex] = undefined;
        this.hasPreReq[slotIndex] = false;
        this.preReqPart[slotIndex] = undefined;
        this.partCode[slotIndex] = undefined;
        this.partDescription[slotIndex] = undefined;
        this.isAlias = [];
        this.aliasOfPartID = [];
        this.useAliasWhenSlot = [];
        this.whenSlotHasPartID = [];
 
        
        this.templatesList[this.selectedTemplateIndex].slots[slotIndex].parts = allPartsForSlot;
        this.stripOutPartsOfActive();
        //this.$forceUpdate();
    },

    updateUsedIfSlot: function(slotID){
      console.log(slotID);

        //loadash find
      this.AliasPartSlotIndex= _.findIndex(this.templatesList[this.selectedTemplateIndex].slots, { 'id': slotID});
    },

    deletePart: async function(displayPartID, slotIndex){
      console.log("deleting part with ID:"+ displayPartID);
      await Cloud.deleteOnePart.with({id: displayPartID});
      var foundIndex = _.findIndex(this.templatesList[this.selectedTemplateIndex].slots[slotIndex].parts, { 'id': displayPartID});
      this.templatesList[this.selectedTemplateIndex].slots[slotIndex].parts.splice(foundIndex, 1);
      this.$forceUpdate();
    },

    stripOutPartsOfActive: function(){
      this.allCurrentParts=[];
      for(i=0; i<this.templatesList[this.selectedTemplateIndex].slots.length; i++){
        var parts = this.templatesList[this.selectedTemplateIndex].slots[i].parts;
        for(v=0; v<parts.length; v++){
          this.allCurrentParts.push(parts[v]);
        }
        this.$forceUpdate();
      }
    }
  }
});
