const frameRate = 30;

//Right SIDE ANIMATION XSLIDER 
const zSlideR = new BABYLON.Animation("zSlideR", "position.z", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

var keyFrames = []; 

keyFrames.push({
	frame: 0,
	value: 0
});

keyFrames.push({
	frame: 1.5*frameRate,//60 2sec
	value: 3
});
keyFrames.push({
	frame: 2*frameRate,//60 2sec
	value: 8
});

zSlideR.setKeys(keyFrames);
// //END RIGHT SIDE ANIMATION XSLIDER


// //Right SIDE ANIMATION XSLIDEL 

const zSlideL = new BABYLON.Animation("zSlideL", "position.z", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

keyFrames = []; 

keyFrames.push({
	frame: 0,
	value: -8
});

keyFrames.push({
	frame: 0.5,
	value: -3
});

keyFrames.push({
	frame: 2*frameRate,//60 2sec
	value: 0
});

zSlideL.setKeys(keyFrames);
// //END RIGHT SIDE ANIMATION XSLIDEL

// //STay the fuck still animation

const relPos = new BABYLON.Animation("relPos", "position.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

keyFrames = []; 

keyFrames.push({
	frame: 0,
	value: 0
});

keyFrames.push({
	frame: 2*frameRate,//60 2sec
	value: 0.2

});

relPos.setKeys(keyFrames);
// //END stay the fuck still animation

