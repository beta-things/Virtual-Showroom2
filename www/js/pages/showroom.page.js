parasails.registerPage('showroom', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    scene : undefined,
    engine : undefined,
    canvas: undefined,
    camera: undefined,
    stagedProduct: {onstage:[], offstage:[]},
    allParts : {onstage:[], offstage:[]},
    h1: undefined, //highlight space object

    client:undefined,
    salesAgent: undefined,
    build: undefined,
    isLoggedInAgent: false,
    agentOnline: false,
    clientOnline: false,

    selectedPartForSlot: [],
    partIsLoading:[],

    templateWithSlots: undefined,
    priceForSlot: [],
    mirrorOBJ: undefined,
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    this.updateSelectedPartForSlot(this.templateWithSlots);
    
  },

  mounted: async function(data) {
  
    //on exit send message that we are offline
    window.addEventListener('beforeunload', () => {
      //send leaving status
      io.socket.get('/api/v1/meeting-participants', {sessionCode:this.build.sessionCode , isAdmin:this.isLoggedInAgent, isResponse: true, makeLogout: true }, function (data, jwRes){
        console.log('leaving meeting. Response :  ' + jwRes.statusCode + ' and data: ', data);
      });
    });
    
    //when we recieve a message, use it to update the logged in userrs
    io.socket.on('im-here', (reply) => {
      if(!reply.isResponse){
        //"I'm here, broadcast
        io.socket.get('/api/v1/meeting-participants', {sessionCode:this.build.sessionCode , isAdmin:this.isLoggedInAgent, isResponse: true, makeLogout: false}, function (data, jwRes){
          console.log('recieved socket message : ' + jwRes.statusCode + ' and data: ', data);
        });
      }
      if(reply.isAdmin){
        this.agentOnline = !reply.makeLogout; 
      }else{
        this.clientOnline = ! reply.makeLogout;
      }
    });

    //set logged in variable for who we are.
    if(this.isLoggedInAgent){
      //set local var and broadcast our status and check theirs
      this.agentOnline = true;
     }else{
      //set local var and broadcast our status and check theirs
      this.clientOnline = true;
    }
    //set socket hook NOTES
    io.socket.on('notes-change', (notes) => {
      this.build.buildNotes = notes;
    });
    //make connection to get socket from server regarding notes
    io.socket.get('/api/v1/build-notes',{customerId : this.client.id, sessionCode : this.build.sessionCode, buildID : this.build.id});

    //set socket hook build parts change
    io.socket.on('build-parts-change', async (data) =>{
      //if this is a response for a part delete call
      if(data.deleted){
        //go through every slot above the one being removed, and remove them if not empty
        await removePart(data.slotIndex, data.offstageIndex, this.stagedProduct, this.scene);
        this.partIsLoading[data.slotIndex] = false;
      }else{
        var slotContent = _.find(this.build.buildParts, {slot:data.slotID});
        if(slotContent){//do we already have something in that slot?
          await swapPart(data.slotIndex, data.offstageIndex, this.stagedProduct, this.scene, this.mirrorOBJ);//yes: do a swap
          this.partIsLoading[data.slotIndex] = false; 
        }else{
          await addPart(data.slotIndex, data.offstageIndex, this.stagedProduct, this.scene, this.mirrorOBJ);//no: just add it
          this.partIsLoading[data.slotIndex] = false; 
        }
        
        
      }
      
      //update build obj for VUE rendering
      this.build = data.build;
      this.templateWithSlots = data.templateWithSlots;
      //update selectedPartForSlot for VUE rendering
      this.updateSelectedPartForSlot(data.templateWithSlots);

    });

    //get a socket connection for the build parts connection
    io.socket.get('/api/v1/build-parts-update', {connect : true, buildID : this.build.id, sessionCode : this.build.sessionCode}, function (data, jwRes){
      console.log('build parts socket (for connect req) returned : ' + jwRes.statusCode + ' and data: ', data);
    } );

    BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
      if (document.getElementById("customLoadingScreenDiv")) {
        document.getElementById("customLoadingScreenDiv").style.display = "flex ";
        return;
      }
      this._loadingDiv = document.createElement("div");
      this._loadingDiv.id = "customLoadingScreenDiv";
      this._loadingDiv.innerHTML = " <div id='home_boarder'> <img src='/images/TS_LOADER.gif'/> </div>";
      var customLoadingScreenCss = document.createElement('style');
      
      this._resizeLoadingUI();
      window.addEventListener("resize", this._resizeLoadingUI);
      document.body.appendChild(this._loadingDiv);
    }

    BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI =  async function(){
			if (document.getElementById("customLoadingScreenDiv")) {
				$('#home_boarder').fadeOut( 500, function() {
					$('#customLoadingScreenDiv').fadeOut( 1500, function() {
						//document.getElementById("customLoadingScreenDiv").remove();
						console.log("scene is now loaded");
					});
				});
			}
			
			
		}
  	
    this.canvas = document.getElementById('render-window');
    // Load the 3D engine
    this.engine = new BABYLON.Engine(this.canvas, true, {preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false});
    // call the createScene function

    await this.createScene();
    // run the render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    
    // the canvas/window resize event handler
    window.addEventListener('resize', () => {
      this.engine.resize();
    });

    //say Im logged in with assets loaded
    io.socket.get('/api/v1/meeting-participants', {sessionCode:this.build.sessionCode , isAdmin:this.isLoggedInAgent, isResponse: false}, function (data, jwRes){
      console.log('create connection for meeting participants returned:  ' + jwRes.statusCode + ' and data: ', data);
    });
    
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    
    // CreateScene function that creates and return the scene
    createScene : async function(){
      
      this.engine.displayLoadingUI();
      // Create a basic BJS Scene object
      this.scene = new BABYLON.Scene(this.engine);
			this.scene.clearColor = BABYLON.Color3.Black();
            
      addTheLights(this.scene);    
      addFog(this.scene);

      await importMeshItems(this.scene, this.templateWithSlots.meshFileName);

      this.camera = addAndSetDefaultCamera(this.scene, this.camera, this.canvas);
      
      constructPartsArray(this.templateWithSlots, this.allParts);

      //kinda messy, but the stager also returns the mirror object
			this.mirrorOBJ = await stageMeshItems(this.scene, this.allParts, this.stagedProduct); //fills the staged object and amalgamates object's children animations
				
      //this.scene.debugLayer.show();

    },
                          //index       , index    ,   ID,    
    callUpdateBuildPart: function(stackPosition, offstageID, slotID ){
      this.partIsLoading[stackPosition] = true;
      var newPartID = this.templateWithSlots.slots[stackPosition].parts[offstageID].id;
      //swapPart(stackPosition, offstageID, this.stagedProduct, this.scene);
      io.socket.get('/api/v1/build-parts-update', {buildID: this.build.id, 
                                                    sessionCode: this.build.sessionCode, 
                                                    slotIndex: stackPosition,
                                                    offstageIndex: offstageID,
                                                    newPartId: newPartID,
                                                    slotID: slotID
                                                     } );
    },

    callAddPart: function(stackPosition, offstageID, slotID){
     
        var newPartID = this.templateWithSlots.slots[stackPosition].parts[offstageID].id;
        //addPart(slotIndex, offstageID, this.stagedProduct, this.scene);
        io.socket.get('/api/v1/build-parts-update', {buildID: this.build.id, 
                                                  sessionCode: this.build.sessionCode, 
                                                  slotIndex: stackPosition,
                                                  offstageIndex: offstageID,
                                                  newPartId: newPartID,
                                                  slotID: slotID
                                                  } );
     

    },

    callRemovePart: function(slotIndex, offstageID){
      this.partIsLoading[slotIndex] = true;
      io.socket.get('/api/v1/build-parts-update', {
        buildID: this.build.id, 
        sessionCode: this.build.sessionCode, 
        slotIndex: slotIndex,
        offstageIndex: offstageID,
        delete: true,
     
      });
    },

    updateNotes: function(){
      io.socket.get('/api/v1/build-notes?sessionCode='+this.build.sessionCode+'&buildNotes='+this.build.buildNotes+'&buildID='+this.build.id, function gotResponse(data, jwRes) {
        //console.log('Server responded with status code ' + jwRes.statusCode + ' and data: ', data);
      });
    },

    updateSelectedPartForSlot: function(templateWithSlots){
      //set active parts in the front end selectedPartForSlot variable so the menu system can set the data
      for(i=0; i<templateWithSlots.slots.length; i++){
        for(v=0; v<templateWithSlots.slots[i].parts.length; v++){
          if(templateWithSlots.slots[i].parts[v].active == true){
            
            this.selectedPartForSlot[i]=v;
            break;
          }else{
            this.selectedPartForSlot[i]="none";//if none set for slot, default to none elemnt 
          }
        }
      }
    },

    formatPrice: function(formValue){
      console.log("form value is "+formValue);
      return "1331.11";
    },
    makeScreenShot: async function(buildCode){
      var  canvas = document.getElementById('render-window');
      canvas.style.width = "400px";
      canvas.style.height = "800px";
      this.engine.resize();

      this.camera.alpha = 1.04;
      this.camera.beta = 1.80;
      this.camera.radius = 3;

      this.scene.clearColor = BABYLON.Color3.White();
     
      var image = await BABYLON.Tools.CreateScreenshotAsync(this.engine, this.camera, {width:400, height:800});

      await Cloud.uploadScreenshot.with({buildCode: buildCode, photo:image});
      console.log("IMAGE FINSIHED UPLAODING");

      window.location.replace("/quote/"+buildCode);

      this.scene.clearColor = BABYLON.Color3.Black();

      canvas.style.width = "100%";
      canvas.style.height = "100%";
      this.engine.resize();
  


    },
    
  }
});
