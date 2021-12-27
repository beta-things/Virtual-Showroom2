var importMeshItems = async function(scene, meshName){
	BABYLON.SceneLoader.OnPluginActivatedObservable.addOnce(loader => {
        loader.animationStartMode = BABYLON.GLTFLoaderAnimationStartMode.NONE;
      });

      await BABYLON.SceneLoader.AppendAsync("/meshes/", meshName, this.scene);
}

var constructPartsArray = function(templateWithSlots, allParts){
	
	for(i=0; i<templateWithSlots.slots.length; i++){//SLOT LEVEL
		
		allParts.offstage[templateWithSlots.slots[i].stackPosition] = [];

		for(v=0; v<templateWithSlots.slots[i].parts.length; v++){//PART LEVEL aka OFFSTAGE IDS
			
			var slot = templateWithSlots.slots[i];
			var part = slot.parts[v];

			if(part.active == true){
				allParts.onstage[i] = {name: part.meshName, 
										offstageID: v,
										xOff: part.downstreamXOffset,
										yOff: part.downstreamYOffset,
										hasPreReq: part.hasPreReq,
										preReqPartID: part.preReqPartID,
										partID : part.id,
										offsetObservances: slot.posOffObserve
									};
								
				allParts.offstage[i][v] = {name: "place-holder"};
				
			 }else{
				
				allParts.offstage[i][v] = {name: part.meshName, 
											offstageID: v,
											xOff: part.downstreamXOffset,
											yOff: part.downstreamYOffset,
											hasPreReq: part.hasPreReq,
											preReqPartID: part.preReqPartID,
											partID : part.id,
											offsetObservances: slot.posOffObserve
											};

				if(!allParts.onstage[i]){//dont overwrite a placed object with a placeholder
					allParts.onstage[i] = {name: "place-holder"}
				}
			 }
		}
	}

}		

var addAndSetDefaultCamera = function(scene, camera, canvas){

	// Parameters: name, alpha, beta, radius, target position, scene
	camera = new BABYLON.ArcRotateCamera("ArcRotCamera", 1.04, 1.80, 4, new BABYLON.Vector3(0, 0.75, 0), scene);
	camera.attachControl(this.canvas, true);
	//zoom limits
	camera.lowerRadiusLimit = 1;
	camera.upperRadiusLimit = 4;
	camera.wheelPrecision = 30;
	camera.panningSensibility = 0;
	//clipping
	camera.maxZ = 20;
	camera.minZ = 0.1;
	camera.upperBetaLimit =1.80;

	scene.activeCamera = camera;

	return camera;

}

var generateFlatMirror = function(MIRRORMESH, others, scene){
	// Create, position, and rotate a flat mesh surface.
	var mirrorPlane = BABYLON.MeshBuilder.CreatePlane("mirrorPlane", {width: 1, height: 1}, scene);
	mirrorPlane.position = MIRRORMESH._absolutePosition;
	mirrorPlane.rotation = new BABYLON.Vector3(5.49779, 4.71239, 0); //manually set the mirror plane rotation (45deg & 270deg from initial in radians)
	//set the mirror plane to be parented by the MIRROR MESH
	mirrorPlane.setParent(MIRRORMESH);
	//we don't needto see this plane it is simply our mirror probe whose reflections are mapped to our mirror mesh
	mirrorPlane.isVisible = false;

	//Ensure working with new values for mirror plane by computing and obtaining its worldMatrix
	mirrorPlane.computeWorldMatrix(true);
	var glass_worldMatrix = mirrorPlane.getWorldMatrix();
	

	//Obtain normals for plane and assign one of them as the normal
	var glass_vertexData = mirrorPlane.getVerticesData("normal");
	var glassNormal = new BABYLON.Vector3(glass_vertexData[0], glass_vertexData[1], glass_vertexData[2]);	
	//Use worldMatrix to transform normal into its current value
	glassNormal = new BABYLON.Vector3.TransformNormal(glassNormal, glass_worldMatrix)

	
	// Create the reflective material for the mesh.
	MIRRORMESH.material = new BABYLON.StandardMaterial("mirrorMaterial", scene);
	MIRRORMESH.material.reflectionTexture = new BABYLON.MirrorTexture("mirrorTexture", 2048, scene, true);
	
	// Get a normal vector from the mesh and invert it to create the mirror plane.
	MIRRORMESH.material.reflectionTexture.mirrorPlane = BABYLON.Plane.FromPositionAndNormal(mirrorPlane.position, glassNormal.scale(-1));

	//add items that will be reflected into the renderList
	for (var index = 0; index < others.length; index++) {
		if(others[index].name.includes('primitive')){
			MIRRORMESH.material.reflectionTexture.renderList.push(others[index]);
		}
	}

	return {mirrorPlane:mirrorPlane, MIRRORMESH: MIRRORMESH};
	
}

var regenerateFlatMirror = function(MIRRORMESH, mirrorPlane){
	//MIRRROR STUFF
	//Ensure working with new values for mirror plane by computing and obtaining its worldMatrix
	mirrorPlane.computeWorldMatrix(true);
	var glass_worldMatrix = mirrorPlane.getWorldMatrix();
	//Obtain normals for plane and assign one of them as the normal
	var glass_vertexData = mirrorPlane.getVerticesData("normal");
	var glassNormal = new BABYLON.Vector3(glass_vertexData[0], glass_vertexData[1], glass_vertexData[2]);	
	//Use worldMatrix to transform normal into its current value
	glassNormal = new BABYLON.Vector3.TransformNormal(glassNormal, glass_worldMatrix);
	// Get a normal vector from the mesh and invert it to create the mirror plane.
	MIRRORMESH.material.reflectionTexture.mirrorPlane = BABYLON.Plane.FromPositionAndNormal(mirrorPlane.position, glassNormal.scale(-1));
}

var getAllMeshChildren = function(parentMesh){
	var return_meshes = [];
	if(parentMesh._children){
		parentMesh._children.forEach(element => {
			return_meshes.push(element);
		});
		return_meshes.forEach(element => {
			var theChildrenMeshes = getAllMeshChildren(element);
			if(theChildrenMeshes.length > 0)
				theChildrenMeshes.forEach(el => {
					return_meshes.push(el);
				});
				
		});
	}

	return return_meshes;
}

var stageMeshItems = async function(scene, stagingParts, staged){
	var xOffTally = 0;
	var yOffTally = 0;
	var MIRROR = undefined;
	var MIRROREDS = [];

	//Onstage Parts 
	for(t=0; t<stagingParts.onstage.length; t++){//stack locations


		if(stagingParts.onstage[t].name != "place-holder"){

			var foundTopLevelMesh = scene.getNodeByName(stagingParts.onstage[t].name);

			if(!foundTopLevelMesh){
				console.log("failed to find mesh named: "+stagingParts.onstage[t].name);
			}

			//find mesh's children then find the children's animation groups , then combine them
			//follow every lineage trail to extract all child meshes into an array  
			var allChildMeshes = getAllMeshChildren(foundTopLevelMesh);
			var customAnimGroup = [];
			//then pull all their tageted animations into the customAnimgroup
			if(allChildMeshes.length > 0){
				allChildMeshes.forEach(aMesh => {
					//check for special case MIRROR OR MIRRORED and add special material
					//uses aMesh.id for blender name
					if(aMesh.id == "MIRROR"){
						MIRROR = aMesh;
					}
					if(aMesh.name.includes("MIRRORED")){
						MIRROREDS.push(aMesh);
					}

					var childAnimGroup = getAnimationGroupForObject(aMesh, scene);
					if(childAnimGroup){
						childAnimGroup._targetedAnimations.forEach(targAnim => {
							customAnimGroup.push(targAnim);
						});
					}
				});

			}
		
			//build proto of new animation group then add my array of targeted animations to it 
			var returnAnimGroup = new BABYLON.AnimationGroup();
			
			for(r=0; r<customAnimGroup.length; r++){
				returnAnimGroup.addTargetedAnimation(customAnimGroup[r].animation, customAnimGroup[r].target);
			}
			
			staged.onstage[t] = {
									part: foundTopLevelMesh, 
									animGroup: returnAnimGroup, 
									offstageID:stagingParts.onstage[t].offstageID,
									assembledState: 0,
									xOff: stagingParts.onstage[t].xOff,
									yOff: stagingParts.onstage[t].yOff,	
									hasPreReq: stagingParts.onstage[t].hasPreReq,
									preReqPartID: stagingParts.onstage[t].preReqPartID,	
									partID: stagingParts.onstage[t].partID,	
									offsetObservances: stagingParts.onstage[t].offsetObservances		
								}; 

			//for each offset observance of a part find any live part in that slot and add it's offsets to the tally
			var offsetObservances = stagingParts.onstage[t].offsetObservances;
			for(var obs=0; obs<offsetObservances.length; obs++){
				if(stagingParts.onstage[offsetObservances[obs].stackPosition].name != "place-holder" ){ //so long as there is a part in this slot 
					xOffTally += stagingParts.onstage[offsetObservances[obs].stackPosition].xOff;
					yOffTally += stagingParts.onstage[offsetObservances[obs].stackPosition].yOff;
				}
			
			}

			foundTopLevelMesh.position.x = xOffTally;
			foundTopLevelMesh.position.y = yOffTally;
			
			xOffTally=0;
			yOffTally=0;
			
		}
	}

	
	//offstage parts 
	for(var i=0; i<stagingParts.offstage.length; i++){ //i is stack level
		
		staged.offstage[i] = [];//this stack position can have many candidates
		for(var v=0; v<stagingParts.offstage[i].length; v++){ //v is offstage id for stack level
			if(stagingParts.offstage[i][v].name != "place-holder"){
				var foundMesh = scene.getNodeByName(stagingParts.offstage[i][v].name);
				//build fancy animation group from all the children

				if(!foundMesh){
					console.log("failed to find mesh named: "+stagingParts.offstage[i][v].name);
				}
				
				var customAnimGroup = [];
	
				//grab some child animations
				var allChildMeshes = getAllMeshChildren(foundMesh);


				if(allChildMeshes != null){

					for(x=0; x<allChildMeshes.length; x++){
						var childMesh = allChildMeshes[x];

						if(childMesh.id == "MIRROR"){
							MIRROR = childMesh;
						}
						if(childMesh.name.includes("MIRRORED")){
							MIRROREDS.push(childMesh);
						}

						//check for special case MIRROR OR MIRRORED and add special material
						//uses childMesh.id for blender name
						var childAnimGroup = getAnimationGroupForObject(childMesh, scene);
						if(childAnimGroup){
							for(y=0; y<childAnimGroup._targetedAnimations.length; y++){
								customAnimGroup.push(childAnimGroup._targetedAnimations[y]);
							}

						}
					}
				}
				
				//build proto of new animation group then add my array of targeteds to it
				var returnAnimGroup = new BABYLON.AnimationGroup();
				
				for(r=0; r<customAnimGroup.length; r++){
					returnAnimGroup.addTargetedAnimation(customAnimGroup[r].animation, customAnimGroup[r].target);
				}
				
				staged.offstage[i][v]={
											part: foundMesh, 
											animGroup: returnAnimGroup, 
											offstageID: v,
											assembledState: 0,
											xOff: stagingParts.offstage[i][v].xOff,
											yOff: stagingParts.offstage[i][v].yOff,	
											hasPreReq: stagingParts.offstage[i][v].hasPreReq,
											preReqPartID: stagingParts.offstage[i][v].preReqPartID,	
											partID: stagingParts.offstage[i][v].partID,
											offsetObservances: stagingParts.offstage[i][v].offsetObservances
									};
				
				
				foundMesh.position.z = 15;
				foundMesh.setEnabled(false);
				
			}	
		}
	}
	// MIRROR STUFF
	var mirrorOBJ = generateFlatMirror(MIRROR, MIRROREDS, scene);
	
	return {
		mirrorOBJ : mirrorOBJ,
		stagedProduct: staged,
	};
			
}

var addTheLights = function(scene){
	var baseLightIntensity = 120;

	var light1 = new BABYLON.SpotLight("spotLight1", new BABYLON.Vector3(-1, 3, 1), new BABYLON.Vector3(0.3, -1, -0.3), Math.PI / 3, 1, scene);
	light1.diffuse = new BABYLON.Color3(1, 1, 0.8);
	light1.specular = new BABYLON.Color3(1, 1, 0.9);
	light1.intensity = baseLightIntensity;
	var light2 = new BABYLON.SpotLight("spotLight2", new BABYLON.Vector3(1, 3, 1), new BABYLON.Vector3(-0.3, -1, -0.3), Math.PI / 3, 1, scene);
	light2.diffuse = new BABYLON.Color3(1, 1, 0.8);
	light2.specular = new BABYLON.Color3(1, 1, 0.9);
	light2.intensity = baseLightIntensity;
	var light3 = new BABYLON.SpotLight("spotLight3", new BABYLON.Vector3(0, 3, -1), new BABYLON.Vector3(-0.1, -1, 0.3), Math.PI / 3, 1, scene);
	light3.diffuse = new BABYLON.Color3(1, 1, 0.8);
	light3.specular = new BABYLON.Color3(1, 1, 0.9);
	light3.intensity = baseLightIntensity;

	// var light4 = new BABYLON.SpotLight("spotLight4", new BABYLON.Vector3(0, .8, -2), new BABYLON.Vector3(0, 0.05, 1), Math.PI / 2, 1, scene);
	// light4.diffuse = new BABYLON.Color3(1, 1, 0.8);
	// light4.specular = new BABYLON.Color3(1, 1, 0.9);
	// light4.intensity = baseLightIntensity;

	var light5 = new BABYLON.SpotLight("spotLight5", new BABYLON.Vector3(-2, .8, 2), new BABYLON.Vector3(1, 0.1, -1), Math.PI / 2, 1, scene);
	light5.diffuse = new BABYLON.Color3(1, 1, 0.8);
	light5.specular = new BABYLON.Color3(1, 1, 0.9);
	light5.intensity = baseLightIntensity;

	// var light6 = new BABYLON.SpotLight("spotLight6", new BABYLON.Vector3(2, .8, 0), new BABYLON.Vector3(-1, 0.2, 0), Math.PI / 2, 1, scene);
	// light6.diffuse = new BABYLON.Color3(1, 1, 0.8);
	// light6.specular = new BABYLON.Color3(1, 1, 0.9);
	// light6.intensity = baseLightIntensity;
}

var addFog = function(scene){
	scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
	scene.fogStart = 4;
	scene.fogEnd = 5;
	scene.fogColor = new BABYLON.Color3.Black();
}

var getAnimationGroupForObject = function(meshObject, scene){
	var aGroups = scene.animationGroups;	
	
	for(var i=0; i<aGroups.length; i++){//each animation group
		group = aGroups[i];
		
		if(group._targetedAnimations[0].target.id == meshObject.id){
			return group;
		}
		
	}
	return false;
	
}

var getAnimatableGroupCurrentFrame = function(animatable){
	return animatable.getAnimations()[0].currentFrame;
}

var theADD = async function(staged, stackPosition, offstageID, scene, mirrorOBJ){
	return new Promise (resolve => {
		var replacing = staged.offstage[stackPosition][offstageID]; 
		//for rapid clicking, the staged element needs to update before animations finish.
		staged.onstage[stackPosition] = replacing;
		staged.offstage[stackPosition][offstageID] = null;

		var easeMode = new BABYLON.QuadraticEase();
		easeMode.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

		zSlideL.setEasingFunction(easeMode);

		replacing.part.animations.push(zSlideL);

		scene.beginDirectAnimation(replacing.part, [zSlideL], 0, 2 * frameRate, false, 2, function(){

			replacing.animGroup.start(false, -1, 2, 0, false);
			replacing.animGroup.onAnimationGroupEndObservable.addOnce(function(){
				regenerateFlatMirror(mirrorOBJ.MIRRORMESH, mirrorOBJ.mirrorPlane);
				resolve('resolved');
			});
		});
	});
}

var addPart = async function(slotsToClear, stackPosition, offstageID, staged, scene, mirrorOBJ){

	// //remove parts in stack positions above selected slot for remove and replace
	//check if there are parts in the stack positions who refer to this one for offsets
	for(i=0; i<slotsToClear.length; i++){
		var removeSlotIndex = slotsToClear[i];
		if( staged.onstage[removeSlotIndex] ){//so long as there is a part in the slot
			staged = await theRemove(removeSlotIndex, staged.onstage[removeSlotIndex].offstageID, staged, scene);
		}
	}	

	var xOffTally = 0;
	var yOffTally = 0;

	//for each offset observance of a part find any live part in that slot and add it's offsets to the tally
	var offsetObservances = staged.offstage[stackPosition][offstageID].offsetObservances;

	for(var obs=0; obs<offsetObservances.length; obs++){
		if(staged.onstage[offsetObservances[obs].stackPosition] ){ //so long as there is a part in this slot 
			var offsetObserveStackPosition = offsetObservances[obs].stackPosition;
			xOffTally += staged.onstage[offsetObserveStackPosition].xOff;
			yOffTally += staged.onstage[offsetObserveStackPosition].yOff;
		}
	}

	staged.offstage[stackPosition][offstageID].part.position.x = xOffTally;
	staged.offstage[stackPosition][offstageID].part.position.y = yOffTally;
	xOffTally = 0;
	yOffTally = 0;

	
	
	//set up just the new part for position and animation
	staged.offstage[stackPosition][offstageID].animGroup.start();
	staged.offstage[stackPosition][offstageID].animGroup.goToFrame(2);
	staged.offstage[stackPosition][offstageID].animGroup.stop();
	staged.offstage[stackPosition][offstageID].part.position.z = 15; 
	staged.offstage[stackPosition][offstageID].part.setEnabled(true);
	


	await theADD(staged, stackPosition, offstageID, scene, mirrorOBJ);
	return true;

}


var swapPart = async function(slotsToClear, stackPosition, offstageID, staged, scene, mirrorOBJ){
	
	if(staged.onstage[stackPosition].offstageID != offstageID){//if the part we're calling has the same offstage id as the one thats there, do nothing
		//check if there are parts in the stack positions who refer to this one for offsets
		for(i=0; i<slotsToClear.length; i++){
			var removeSlotIndex = slotsToClear[i];
			if( staged.onstage[removeSlotIndex] ){//so long as there is a part in the slot
				await theRemove(removeSlotIndex, staged.onstage[removeSlotIndex].offstageID, staged, scene);
			}
		}	 
		//finally remove the part that was orriginally called. 
		await theRemove(stackPosition, staged.onstage[stackPosition].offstageID, staged, scene);
		//now add the part to be swapped in
		await addPart([],stackPosition, offstageID, staged, scene, mirrorOBJ);
	}
}

//removes individual part when called to 
var theRemove = function(stackPosition, offstageID, staged, scene){	
	
	return new Promise (resolve => {
	
		var removed = staged.onstage[stackPosition];

		removed.animGroup.onAnimationGroupEndObservable.addOnce( async function(){//add callback listener end animation
					
			staged.onstage[stackPosition]=null; //set the state of the stack position to null 
			staged.offstage[stackPosition][offstageID] = removed; //add the object to the offtage element for later use
			resolve(staged);

			removed.part.animations.push(zSlideR); // add the z slide right animation to the object 
			scene.beginDirectAnimation(removed.part , [zSlideR], 0, 2 * frameRate, false, 2, async function(){
				staged.offstage[stackPosition][offstageID].part.setEnabled(false);				
			});

		});

		removed.animGroup.start(false, 1, 0, 2, false);//trigger baked open animation 
	
	});
			
}


//build an array including the current part and any element above call theRemove for each from the top down
var removePart = async function(slotsToClear, stackPosition, staged, scene){
	
	//check if there are parts in the stack positions who refer to this one for offsets
	for(i=0; i<slotsToClear.length; i++){
		var removeSlotIndex = slotsToClear[i];
		if( staged.onstage[removeSlotIndex] ){//so long as there is a part in the slot
			await theRemove(removeSlotIndex, staged.onstage[removeSlotIndex].offstageID, staged, scene);
		}
	}	
	//finally remove the part that was orriginally called. 
	if(staged.onstage[stackPosition]){
		await theRemove(stackPosition, staged.onstage[stackPosition].offstageID, staged, scene);
	}
}


var getStackPosAndOffIndex = function(partID, staged){
	for(i=0; i<staged.offstage.length; i++){//stack level
		for(v=0; v<staged.offstage[i].length; v++){//offstage index
			var part = staged.offstage[i][v];
			if(part != null){
				console.log("checking part");
				console.log(part);
				if(part.partID == partID){
					return {stackLevel:i, offstageIndex:v}
				}
			}
		}
	}
}

var animateCameraTo = function(camera, scene, targetAlpha, targetBeta, targetRadius, targetFOV, targetY){
	
	// reseting the alpha and beta to a much simpler version
	//doesnt move the camera but removes multiples of the full rotation.
	camera.alpha = camera.alpha % (Math.PI * 2);
	camera.beta = camera.beta % (Math.PI * 2);
	targetAlpha = targetAlpha % (Math.PI * 2);
	targetBeta = targetBeta % (Math.PI * 2);

	if (camera.alpha < 0) {
		camera.alpha += Math.PI * 2;
	}
	if (camera.beta < 0) {
		camera.beta += Math.PI * 2;
	}
	
	// used to find the shortest curve IE. if angle == 3PI/2 => take the -1PI/2 instead
	if (Math.abs(camera.alpha - targetAlpha) > Math.PI) {
		targetAlpha = targetAlpha + (Math.PI * 2);
	}
	if (Math.abs(camera.beta - targetBeta) > Math.PI) {
		targetBeta = targetBeta + (Math.PI * 2);
	}

	let alphaAnimation = new BABYLON.Animation("camAlpha", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
	let betaAnimation = new BABYLON.Animation("camBeta", "beta", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
	let radiusAnimation = new BABYLON.Animation("camRadius", "radius", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
	let fovAnimation = new BABYLON.Animation("camFOV", "fov", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT); 
	let targetYAnimation = new BABYLON.Animation("camFOV", "_target._y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT); 

	var easeMode = new BABYLON.QuadraticEase();
	easeMode.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

	alphaAnimation.setEasingFunction(easeMode);
	betaAnimation.setEasingFunction(easeMode);
	radiusAnimation.setEasingFunction(easeMode);
	fovAnimation.setEasingFunction(easeMode);
	targetYAnimation.setEasingFunction(easeMode);

	var alphaKeys = [{
		frame : 0,
		value : camera.alpha
	}, {
		frame : 60,
		value : targetAlpha
	}];

	var betaKeys = [{
		frame : 0,
		value : camera.beta
	}, {
		frame : 60,
		value : targetBeta
	}];

	var radiusKeys = [{
		frame : 0,
		value : camera.radius
	}, {
		frame : 60,
		value : targetRadius
	}];

	var fovKeys = [{
		frame : 0,
		value : camera.fov
	}, {
		frame : 60,
		value : targetFOV
	}];

	var targetYKeys = [{
		frame : 0,
		value : camera._target._y
	}, {
		frame : 60,
		value : targetY
	}];

	alphaAnimation.setKeys(alphaKeys);
	betaAnimation.setKeys(betaKeys);
	radiusAnimation.setKeys(radiusKeys);
	fovAnimation.setKeys(fovKeys);
	targetYAnimation.setKeys(targetYKeys);

	camera.animations.push(alphaAnimation);
	camera.animations.push(betaAnimation);
	camera.animations.push(radiusAnimation);
	camera.animations.push(fovAnimation);
	camera.animations.push(targetYAnimation);
	
	scene.beginAnimation(camera, 0, 60, false, 1);

}

var stopAutorotate = function(camera){
	camera.useAutoRotationBehavior = false;
}

var startAutorotate = function(camera){
	camera.useAutoRotationBehavior = true;
}




