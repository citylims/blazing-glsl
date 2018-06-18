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
  this.glitchDir = new ReactiveVar('/');
  this.camToggled = new ReactiveVar(false);
  
  Slingshot.fileRestrictions("myFileUploads", {
    allowedFileTypes: ["image/png", "image/jpeg", "image/gif", "application/pdf"],
    maxSize: null
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
    console.log(e);
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
  
  this.createGlitch = (dir) => {
    GlitchImage.createImageFromList(dir).then(function(res) {
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
    if (effect) {
      effect.render(time, mouse.x, mouse.y);
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
      this.createGlitch(inst.glitchDir.get());
    }
  });
  inst.autorun(() => {
    if (inst.activeUrl.get()) {
      
    }
  });
  
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
  this.createGlitch(dir);
});


