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
    loadingQuote:false,

    templateWithSlots: undefined,
    priceForSlot: [],
    mirrorOBJ: undefined,
    tourMode: true,

      //ped 0: FOV: 0.39 ytarg: 0.35 alpha=6.2832 beta = 1.3340 rad= 4.00
      //pan 1: f=0.41 y = 0.997 al=3.9963 Bet=0.9557 rad = 1.000
      //capsule 2: f=0.2309 y=1.266 al=8.5852 bet = 1.6452 rad= 4
      //prompter mon 3: f =0.2309 y= 1.266 al=6.7214 bet=1.5691 rad 4

    tourModeSlots: [
      {index:0, fov:0.8, targetY: 0.38, alpha:1.8016, beta:1.4414, radius:2.2164},
      {index:1, fov:0.41, targetY: 0.997, alpha:3.996, beta:0.9557, radius:1.00},
      {index:6, fov:0.2309, targetY: 1.266, alpha:8.5852, beta:1.6452, radius:4.00},
      {index:7, fov:0.2309, targetY: 1.266, alpha:6.7214, beta:1.5691, radius:4.00},
    ],
    
    cameraDefaults: {fov:0.8, targetY: 0.75, alpha:1.04, beta:1.80, radius:4.00},

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
      var slotsToClear = data.clearSlotList.reverse();
      if(data.deleted){
        if(this.tourMode){
          this.doGoCamera("Home");
        }
        //go through every slot above the one being removed, and remove them if not empty
        await removePart(slotsToClear, data.slotIndex, this.stagedProduct, this.scene);
        this.partIsLoading[data.slotIndex] = false; //stop spinner

      }else{
        //if we are in tourMode take conttrol of the camera
        if(data.tourMode==true){
          this.doGoCamera(data.slotIndex);
        }

        var slotContent = _.find(this.build.buildParts, {slot:data.slotID});
        if(slotContent){//do we already have something in that slot?
          await swapPart(slotsToClear, data.slotIndex, data.offstageIndex, this.stagedProduct, this.scene);//yes: do a swap
          this.partIsLoading[data.slotIndex] = false; //stop spinner
        }else{
          await addPart(slotsToClear, data.slotIndex, data.offstageIndex, this.stagedProduct, this.scene);//no: just add it
          this.partIsLoading[data.slotIndex] = false; //stop spinner
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

    //SETS TOUR MODE STATUS ON PAGE LOAD
    //check for empty build on load. if empty open the preview interface
    this.tourMode=false;
    // if(this.build.buildParts.length>0){
    //   this.tourMode=false;
    // }else{
    //   for(i=0; i<this.tourModeSlots.length; i++){

    //     var slotIndex = this.tourModeSlots[i].index;
    //     if(slotIndex != "H"){//ALL BUT THE HOMING 
    //       this.tourModeSlots[i].name = this.templateWithSlots.slots[slotIndex].slotName;
    //       this.tourModeSlots[i].slotID = this.templateWithSlots.slots[slotIndex].id;
    //     }
    //   }
    //   this.$forceUpdate();
    // }
    
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
      //addFog(this.scene);

      await importMeshItems(this.scene, this.templateWithSlots.meshFileName);

      this.camera = addAndSetDefaultCamera(this.scene, this.camera, this.canvas);
      
      constructPartsArray(this.templateWithSlots, this.allParts);

      //kinda messy, but the stager also returns the mirror object
      var stagedResult = await stageMeshItems(this.scene, this.allParts, this.stagedProduct); //fills the staged object and amalgamates object's children animations
      //this.mirrorOBJ = stagedResult.mirrorOBJ;
      this.stagedProduct = stagedResult.stagedProduct;

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
                                                  slotID: slotID,
                                                  tourMode: this.tourMode,
                                                  } );
     

    },

    callRemovePart: function(slotIndex, offstageID, slotID){
      this.partIsLoading[slotIndex] = true;
      io.socket.get('/api/v1/build-parts-update', {
        buildID: this.build.id, 
        sessionCode: this.build.sessionCode, 
        slotIndex: slotIndex,
        offstageIndex: offstageID,
        delete: true,
        slotID: slotID,
        tourMode: this.tourMode,
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

    makeScreenShot: async function(buildCode){
      this.loadingQuote = true;

      var  canvas = document.getElementById('render-window');
      canvas.style.width = "400px";
      canvas.style.height = "600px";
      this.engine.resize();

      this.camera.alpha = 1.04;
      this.camera.beta = 1.80;
      this.camera.radius = 2.75;

      this.scene.clearColor = BABYLON.Color3.White();

      //remove the floor 
      var floor = this.scene.getNodeByName("FLOOR");
      floor.isVisible = false;
     
      var image = await BABYLON.Tools.CreateScreenshotAsync(this.engine, this.camera, {width:400, height:600});

      await Cloud.uploadScreenshot.with({buildCode: buildCode, photo:image});
    
      window.location.replace("/quote/"+buildCode);

      this.scene.clearColor = BABYLON.Color3.Black();

      canvas.style.width = "100%";
      canvas.style.height = "100%";
      this.engine.resize();
  


    },
    doGoCamera: function(slotIndex){ 
      if(slotIndex == "Home"){//home 
        var cameraInfo = this.cameraDefaults;
        this.tourMode = false;
      }else{
        var tIndex = _.findIndex(this.tourModeSlots, { 'index': slotIndex });
        var cameraInfo = this.tourModeSlots[tIndex];
      }
      
      animateCameraTo(this.camera, this.scene, cameraInfo.alpha, cameraInfo.beta, cameraInfo.radius, cameraInfo.fov, cameraInfo.targetY )
    
    },

    endTour: function(){
      
      //first slot id 
      var zerothSlotID = this.templateWithSlots.slots[0].id;
      this.callRemovePart(0, 0, zerothSlotID);
      startAutorotate(this.camera);
      
  
    },
    
    

  }


});
