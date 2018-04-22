import THREE from 'three';
import { Promise } from 'meteor/promise';
import SpiderEffect from './spiderEffect.js'


Template.spider.onCreated(function() {
  this.spiderLoaded = new ReactiveVar(false);
});

Template.spider.onRendered(function() {
  let inst = Template.instance();
  console.log('ayb')
  this.createSpider = () => {
    SpiderEffect.createEffect().then(function(res) {
      inst.spiderLoaded.set(res);
    });
    // GlitchImage.createImage().then(function(res) {
    //   inst.loadedImage.set(res);
    // });
    // 
    // GlitchEffect.createEffect(renderBack1.texture).then(function(res) {
    //   inst.loadedEffect.set(res);
    // });
  }
  const canvas = document.getElementById('spiderCanvas');
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    canvas: canvas,
  });
  const renderTar = new THREE.WebGLRenderTarget(document.body.clientWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, document.body.clientWidth / window.innerHeight, 1, 10000);
// scene.add( camera );
  const render = () => {
    renderer.render(scene, camera, renderTar);
  }
  const renderLoop = () => {
    render();
    requestAnimationFrame(renderLoop);
  }
  inst.autorun(() => {
    if (inst.spiderLoaded.get()) {
      renderer.setSize(document.body.clientWidth, window.innerHeight);
      renderer.setClearColor(0x555555, 1.0);
      var spider = inst.spiderLoaded.get();
      console.log(spider);
      scene.add(spider.mesh)
    };
  });
  
  this.createSpider();
  
});