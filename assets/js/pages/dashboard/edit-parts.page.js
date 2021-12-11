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

    //INTERPOLATED VALUES
    AliasPartSlotIndex:undefined,
    
    partAliasTrunks: [],

    editPartAtSlot: [],
    editPartAtSlotID: [],

  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    //…
  },
  mounted: async function() {

     
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    createPart: async function(slotIndex){
        var slotID = this.templatesList[this.selectedTemplateIndex].slots[slotIndex].id;

        if(Array.isArray(this.partAliasTrunks[slotIndex])){
          var aliasTrunks = this.partAliasTrunks[slotIndex];
        }else{
          var aliasTrunks = [];
        }

        var addPartReturn = await Cloud.addPartToSlot.with({
          friendlyName:this.displayName[slotIndex], 
          meshName: this.meshName[slotIndex],
          optionForSlotID: slotID,
          isAliasPart: this.isAlias[slotIndex],
          aliasRefName: this.aliasRefName[slotIndex],
          aliasOfPartID:this.aliasOfPartID[slotIndex],
          aliasTrunks: aliasTrunks,
          downstreamXOffset : this.xOffset[slotIndex],
          downstreamYOffset : this.yOffset[slotIndex],
          downstreamZOffset : this.zOffset[slotIndex],
          partCode : this.partCode[slotIndex],
          partDescription: this.partDescription[slotIndex],
        });


        this.clearFormAtSlot(slotIndex);
 
        
        this.templatesList[this.selectedTemplateIndex].slots[slotIndex].parts = addPartReturn.allPartsForSlot;
        this.$forceUpdate();
        //this.stripOutPartsOfActive();
    },

    saveEdit: async function(slotIndex, partID){
      // should make an update part function to call and then do similar things to what create part does 
      var slotID = this.templatesList[this.selectedTemplateIndex].slots[slotIndex].id;

        if(Array.isArray(this.partAliasTrunks[slotIndex])){
          var aliasTrunks = this.partAliasTrunks[slotIndex];
        }else{
          var aliasTrunks = [];
        }

        var addPartReturn = await Cloud.addPartToSlot.with({
          update: true,
          updatePartID: partID,
          friendlyName:this.displayName[slotIndex], 
          meshName: this.meshName[slotIndex],
          optionForSlotID: slotID,
          isAliasPart: this.isAlias[slotIndex],
          aliasRefName: this.aliasRefName[slotIndex],
          aliasOfPartID:this.aliasOfPartID[slotIndex],
          aliasTrunks: aliasTrunks,
          downstreamXOffset : this.xOffset[slotIndex],
          downstreamYOffset : this.yOffset[slotIndex],
          downstreamZOffset : this.zOffset[slotIndex],
          partCode : this.partCode[slotIndex],
          partDescription: this.partDescription[slotIndex],
        });
        
        this.templatesList[this.selectedTemplateIndex].slots[slotIndex].parts = addPartReturn.allPartsForSlot;      
        this.cancelEdit(slotIndex);
    },


    updateUsedIfSlot: function(slotID){ //update the stored index of the slot we want to reference as a precondition of using this alias
      //loadash find
      this.AliasPartSlotIndex= _.findIndex(this.templatesList[this.selectedTemplateIndex].slots, { 'id': slotID});
    },

    deletePart: async function(displayPartID, slotIndex){
      console.log("deleting part with ID:"+ displayPartID);
      
      await Cloud.deleteOnePart.with({id: displayPartID});
      var foundIndex = _.findIndex(this.templatesList[this.selectedTemplateIndex].slots[slotIndex].parts, { 'id': displayPartID});
      this.templatesList[this.selectedTemplateIndex].slots[slotIndex].parts.splice(foundIndex, 1);
      this.$forceUpdate();
      return;
    },

    editPart: function(displayPartIndex, slotIndex){ //start edit of created part
      
      var templatePart = this.templatesList[this.selectedTemplateIndex].slots[slotIndex].parts[displayPartIndex];//for simplify below

      this.editPartAtSlot[slotIndex] = true; //set that we are editing at this slot
      this.editPartAtSlotID[slotIndex] = templatePart.id; //set the part id we will be editing at this slot

      //set all the fields with the existing data
      this.displayName[slotIndex] = templatePart.friendlyName;
      this.meshName[slotIndex] = templatePart.meshName;
      this.partCode[slotIndex] = templatePart.partCode;
      this.partDescription[slotIndex] = templatePart.partDescription;
      this.xOffset[slotIndex] = templatePart.downstreamXOffset;
      this.yOffset[slotIndex] = templatePart.downstreamYOffset;
      this.zOffset[slotIndex] = templatePart.downstreamZOffset;
      this.isAlias[slotIndex]= templatePart.isAliasPart;
      this.aliasRefName[slotIndex] = templatePart.aliasRefName;
      this.aliasOfPartID[slotIndex] = templatePart.aliasOfPartID;
     
      this.partAliasTrunks[slotIndex] = templatePart.aliasTrunks; //alias trunks has been injected from the back end
      
      this.$forceUpdate();
    
    },

    cancelEdit: function(slotIndex){
      this.editPartAtSlot[slotIndex] = false;
      this.clearFormAtSlot(slotIndex);
      this.$forceUpdate();
    },

    addAliasTrunk: async function(slotIndex){
      var trunkWhenSlot = {
        id : this.useAliasWhenSlot[slotIndex].id,//equates to a slot id
        slotName : this.useAliasWhenSlot[slotIndex].slotName,
      };    
      var trunkSlotHasPart={
        id: this.whenSlotHasPartID[slotIndex].id, //equates to a part id
        friendlyName: this.whenSlotHasPartID[slotIndex].friendlyName,
      };
      if(!Array.isArray(this.partAliasTrunks[slotIndex])){
        this.partAliasTrunks[slotIndex] = [];
      }
              
      this.partAliasTrunks[slotIndex].push({slot:trunkWhenSlot, part: trunkSlotHasPart});

      this.useAliasWhenSlot[slotIndex] = undefined;
      this.whenSlotHasPartID[slotIndex] = undefined;

      this.$forceUpdate();
    },

    clearFormAtSlot: function(slotIndex){
      //reset form
      this.displayName[slotIndex] = undefined;
      this.meshName[slotIndex] = undefined;
      this.xOffset[slotIndex] = undefined;
      this.yOffset[slotIndex] = undefined;
      this.zOffset[slotIndex] = undefined;
      this.isAlias[slotIndex]= undefined;
      this.aliasRefName[slotIndex] = undefined;
      this.partAliasTrunks[slotIndex] = [];
      this.partCode[slotIndex] = undefined;
      this.partDescription[slotIndex] = undefined;
      this.aliasOfPartID[slotIndex] = undefined;
      this.useAliasWhenSlot[slotIndex] = undefined;
      this.whenSlotHasPartID[slotIndex] = undefined;
    }
  }
});
 