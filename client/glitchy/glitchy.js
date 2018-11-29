import THREE from 'three';
import { Promise } from 'meteor/promise';
import GlitchImage from './glitchImage.js';
import GlitchEffect from './glitchEffect.js';


Template.glitchy.onCreated(function() {
  this.loadedImage = new ReactiveVar(false)
  this.loadedEffect = new ReactiveVar(false)
  this.activeScene = new ReactiveVar(false);
  this.toggleUpload = new ReactiveVar(false);
  this.uploader = new ReactiveVar(false);
  this.file = new ReactiveVar(false);
  this.activeUrl = new ReactiveVar(false);
  this.glitchFactor = new ReactiveVar({glitchFactorX: 0.00, glitchFactorY: 0.00});
  this.glitchDir = new ReactiveVar('/winter');
  this.moodName = new ReactiveVar('Winter');
  this.glitchPair = new ReactiveVar(false);
  this.camToggled = new ReactiveVar(false);
  this.audioViz = new ReactiveVar(true);
  this.song = new ReactiveVar(false);
  
  Slingshot.fileRestrictions("myFileUploads", {
    allowedFileTypes: ["image/png", "image/jpeg", "image/gif", "application/pdf"],
    maxSize: null
  });
  
  this.autorun(() => {
    if (this.moodName.get()) {
      var moodName = this.moodName.get()
      console.log(Moods.findOne({moodName: moodName}));
      var mood = Moods.findOne({moodName: moodName});
      console.log(mood);
      if (mood && mood.pairs.length) {
        var pair = mood.pairs[Math.floor(Math.random() * mood.pairs.length)];
        console.log(pair);
        this.glitchPair.set(pair);
      }
    }
    // if (Moods.findOne({moodName: this.moodName.get()})) {
    //   var mood = Moods.findOne({moodName: this.moodName});
    //   console.log(mood);
    // }
    // if (Moods.find()) {
    //   var moods = Moods.find().fetch();
    //   console.log(moods);
    //   if (moods && moods.length) {
    //     if (moods.types[this.moodName.get()]pairs.length) { //always be there
    //       var initialSet = moods.pairs[0];
    //       // var initialSet = moods.pairs[Math.floor(Math.random()*moods.pairs.length]);
    //       console.log(initialSet);
    //       this.glitchPair.set(initialSet);
    //     }    
    //   }
    // }
  });

 });
 
 Template.glitchy.helpers({
  glitchFactor: function(axis) {
    if (axis === 'x') {
      return `${Template.instance().glitchFactor.get().glitchFactorX.toFixed(0)}%`
    } else {
      return `${Template.instance().glitchFactor.get().glitchFactorY.toFixed(0)}%`
    }
  } ,
  isBird: function() {
    if (Template.instance().glitchDir.get() === '/bird') {
      return true;
    }
  },
  isUpload: function() {
    return Template.instance().toggleUpload.get();
  },
  camToggled: function() {
    return Template.instance().camToggled.get();
  },
  camToggled: function() {
    return Template.instance().camToggled.get();
  },
  audioVizToggled: function() {
    return Template.instance().audioViz.get();
  },
  glitchVisiblity: function() {
    if (Template.instance().camToggled.get()) {
      return 'visbility:hidden;';
    } else {
      return '';
    }
  }
});

Template.glitchy.events({
  'click [data-action="toggleCam"]': function(e,t){
    t.camToggled.set(!t.camToggled.get());
    t.cycleScene();
  },
  'click [data-action="restart"]': function(e,t) {
    t.cycleScene();
    // if (t.activeScene.get()) {
    //   let scene = t.activeScene.get();
    //   while(scene.children.length > 0){ 
    //     scene.remove(scene.children[0]); 
    //   }
    // }
    t.createGlitch(t.glitchDir.get());
  },
  'click [data-action="toggleDir"]': function(e,t) {
    t.cycleScene();
    if (t.glitchDir.get() === '/') {
      t.glitchDir.set('/bird');
    } else {
      t.glitchDir.set('/');
    }
  },
  'click [data-action="toggleUpload"]': function(e,t) {
    t.toggleUpload.set(!t.toggleUpload.get());
  },
  'click [data-action="audioViz"]': function(e,t) {
    t.audioViz.set(!t.audioViz.get());
  },
  'change #inputFile': function(e,t) {
    t.uploader.set(false);
    var file = document.getElementById('inputFile').files[0];
    if (!file) return;
    var metaContext = {text: 'test'};
    var uploader = new Slingshot.Upload('pigeonUpload', metaContext); 
    t.file.set(file);
    t.uploader.set(uploader);
    uploader.send(document.getElementById('inputFile').files[0], (err, downloadUrl) => {
      if (err) {
        alert('failed to upload')
        console.log('Error upload');
        console.log(err);
        t.file.set(false);
      } else {
        console.log(downloadUrl);
        t.activeUrl.set(downloadUrl);
          t.cycleScene();
          t.createUploadGlitch(downloadUrl);
          t.toggleUpload.set(false);
        // t.activeUrl.set(downloadUrl);
        // var updateParams = {
        //   fileName: file.name,
        //   fileType: file.type,
        //   dateModified: file.lastModifiedDate,
        //   url: downloadUrl
        // }
        //save in mongo?
      }
    });
  }
});

Template.glitchy.onRendered(function() {
  var inst = Template.instance();
  var dir = inst.glitchDir.get();
  
  

  const canvas = document.getElementById('glitchyCanvas');
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    canvas: canvas,
  });
  const renderBack1 = new THREE.WebGLRenderTarget(document.body.clientWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const sceneBack = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const cameraBack = new THREE.PerspectiveCamera(45, document.body.clientWidth / window.innerHeight, 1, 10000);
  const clock = new THREE.Clock();
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  document.addEventListener('mousemove', onMouseMove, false );
  document.addEventListener('mousedown', onMouseDown, false );
  
  var audioListener = new THREE.AudioListener();
  camera.add( audioListener );
  var song = new THREE.Audio( audioListener );
  scene.add( song );
  // instantiate a loader
  var audioLoader = new THREE.AudioLoader();
  var analyser = new THREE.AudioAnalyser( song, 256 );
    
  // audioLoader.load( 'audio/MerryXmas.mp3', ( audioBuffer ) => {
  //   
	// 	song.setBuffer( audioBuffer );
  //   inst.song.set(song);
	// 	// song.play();
  //   analyser = new THREE.AudioAnalyser( song, 256 );
	// });
  
  
  
  this.createGlitch = (dir) => {
    GlitchImage.createImageFromList(dir).then(function(res) {
      inst.loadedImage.set(res);
    });

    GlitchEffect.createEffect(renderBack1.texture).then(function(res) {
      inst.loadedEffect.set(res);
    });
  }
  
  this.createGlitchPair = (imageUrl) => {
    GlitchImage.createImageFromUrl(imageUrl).then(function(res) {
      inst.loadedImage.set(res);
    });

    GlitchEffect.createEffect(renderBack1.texture).then(function(res) {
      inst.loadedEffect.set(res);
    });
  }
  
  this.createUploadGlitch = (imageUrl) => {
    inst.camToggled.set(false);
    
    GlitchImage.createImageFromUrl(imageUrl).then(function(res) {
      inst.loadedImage.set(res);
    });

    GlitchEffect.createEffect(renderBack1.texture).then(function(res) {
      inst.loadedEffect.set(res);
    });
  }
  
  this.cycleScene = () => {
    inst.loadedImage.set(false);
    inst.loadedEffect.set(false);
    if (inst.activeScene.get()) {
      let scene = inst.activeScene.get();
      while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
      }
    }
  }
  
  this.calcAverageFreq = (arr) => {
    var total = _.reduce(arr, function(memo, num) {return memo + num});;
    // console.log(total)
    return total / (arr.length * 2);
  }
  
  function onMouseDown(e) {
    //freeze frame
    inst.glitchFactor.set({glitchFactorX: 0, glitchFactorY: 0});
    mouse.x = 0.01;
    mouse.y = 2.00
  }

  function onMouseMove(e) {
    var rangeX = parseInt($('body').width());
    var glitchScale = 100.0;
    var xFactor = (e.clientX / rangeX) * 100;
    var glitchFactorX = parseFloat(glitchScale * (xFactor * 0.01));
    mouse.x = glitchFactorX;
    
    var rangeY = parseInt($('#glitchyCanvas').innerHeight());
    var yScale = 100.0
    var yFactor = (e.clientY / rangeY) * 100;
    var scaleDiff = 3;
    var min = 3.0
    var glitchFactorY = (parseFloat(yScale * (yFactor * 0.01))) / scaleDiff;
    // console.log(e.clientY)
    // console.log(glitchFactorY)
    if (glitchFactorY < min) {
      mouse.y = 3.00
    } else {
      mouse.y = glitchFactorY;
    }
    inst.glitchFactor.set({
      glitchFactorX,
      glitchFactorY
    })
    // console.log(mouse.y)
    // inst.glitchFactor.set(glitchFactorX);
  	// mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }
  
  const resizeWindow = () => {
    canvas.width = document.body.clientWidth;
    canvas.height = window.innerHeight;
    cameraBack.aspect = document.body.clientWidth / window.innerHeight;
    cameraBack.updateProjectionMatrix();
    // img.resize();
    // effect.resize();
    renderBack1.setSize(document.body.clientWidth, window.innerHeight);
    renderer.setSize(document.body.clientWidth, window.innerHeight);
  }
  const render = () => {
    if (!inst.activeScene.get()) return;
    var time = clock.getDelta();
    renderer.render(sceneBack, cameraBack, renderBack1);
    var effect = inst.loadedEffect.get();
    if (inst.audioViz.get()) {
      var audioData  = analyser.getFrequencyData();
      if (!audioData.length) return;
      var high = audioData.slice(0, audioData.length / 2);
      var low = audioData.slice(audioData.length /2, audioData.length);
      //half array top freq can be noise 
      //low can be shake
      var noiseFreq = (inst.calcAverageFreq(high) / 2);
      // console.log(noiseFreq)
      var shakeFreq = (inst.calcAverageFreq(low) / 3.5);
      if (effect) {
        effect.render(time, noiseFreq, shakeFreq)
      }
    } else {
      if (effect) {
        effect.render(time, mouse.x, mouse.y);
      }
    }
  
    renderer.render(scene, camera);
  }
  
  const renderLoop = () => {
    render();
    requestAnimationFrame(renderLoop);
  }
  // 
  // const vectorTouchStart = new THREE.Vector2();
  // const vectorTouchMove = new THREE.Vector2();
  // const vectorTouchEnd = new THREE.Vector2();
  // let isDrag = false;
  
  inst.autorun(() => {
    if (inst.loadedImage.get() && inst.loadedEffect.get()) {
      renderer.setSize(document.body.clientWidth, window.innerHeight);
      renderer.setClearColor(0x555555, 1.0);
      cameraBack.position.set(1000, 1000, 1000);
      cameraBack.lookAt(new THREE.Vector3());
      var img = this.loadedImage.get()
      var effect = this.loadedEffect.get()
      sceneBack.add(img.mesh);
      scene.add(effect.mesh);
      inst.activeScene.set(scene);
      // on();
      renderLoop();
    }
  });
  
  inst.autorun(() => {
    if (inst.glitchDir.get()) {
      // this.createGlitch(inst.glitchDir.get());
    }
    if (inst.glitchPair.get()){
      this.createGlitchPair(inst.glitchPair.get().visual.fileLocation)
      audioLoader.load( inst.glitchPair.get().audio.fileLocation, ( audioBuffer ) => {
        console.log('load song');
    		song.setBuffer( audioBuffer );
        inst.song.set(song);
    		// song.play();
        analyser = new THREE.AudioAnalyser( song, 256 );
    	});
    }
  });

  inst.autorun(() => {
    if (inst.song.get()) {
      var song = inst.song.get();
      if (inst.audioViz.get()) {
        console.log(song);
        song.play();
      } else if (!inst.audioViz.get()) {
        song.stop();
      }
      
    }
  })
  
  
  inst.autorun(() => {
    if (Session.get('camUrl')) {
      // inst.cycleScene();
      console.log(Session.get('camUrl'));
      var url = Session.get('camUrl');
      // inst.camToggled.set(false);
      inst.createUploadGlitch(url)
    }
  });
  //call inital glitch
  // this.createGlitch(dir);
});

