import THREE from 'three';
import { Promise } from 'meteor/promise';

export const createImageFromList = function(dir) {
  return new Promise(function(resolve, reject) {
    let img = {}
    img.uniforms = {
      time: {
        type: 'f',
        value: 0
      },
      resolution: {
        type: 'v2',
        value: new THREE.Vector2(document.body.clientWidth, window.innerHeight)
      },
      texture: {
        type: 't',
        value: null,
      }
    };
    this.imageApply = () => {
      
    }
    const loader = new THREE.TextureLoader();
    // Session.set('hello', 'hello');
    // console.log(Session.get('hello'))
    loader.setCrossOrigin("*");
    // let dir = "";
    Meteor.call('listS3Images', dir,  function(err, images) {
      var image = images[Math.floor(Math.random()*images.length)];
      loader.load(`${image}`, (texture) => {
        img.uniforms.texture.value = texture;
        Meteor.call('fetchGlsl', 'glitchImage.vs', (errV, imageShader) => {
          Meteor.call('fetchGlsl', 'glitchImage.fs', (errF, imageFrag) => {
            img.mesh = new THREE.Mesh(
              new THREE.PlaneBufferGeometry(2, 2),
              new THREE.RawShaderMaterial({
                uniforms: img.uniforms,
                vertexShader: imageShader,
                fragmentShader: imageFrag
              })
            );
            resolve(img);
          });
        });
      });
    });
  });
}

export const createImageFromUrl = function(imageUrl) {
  return new Promise(function(resolve, reject) {
    let img = {}
    img.uniforms = {
      time: {
        type: 'f',
        value: 0
      },
      resolution: {
        type: 'v2',
        value: new THREE.Vector2(document.body.clientWidth, window.innerHeight)
      },
      texture: {
        type: 't',
        value: null,
      }
    };
    this.imageApply = () => {
      
    }
    const loader = new THREE.TextureLoader();
    // Session.set('hello', 'hello');
    // console.log(Session.get('hello'))
    loader.setCrossOrigin("*");
    // let dir = "";
    // Meteor.call('listS3Images', dir,  function(err, images) {
    var image = imageUrl;
    loader.load(`${image}`, (texture) => {
      img.uniforms.texture.value = texture;
      Meteor.call('fetchGlsl', 'glitchImage.vs', (errV, imageShader) => {
        Meteor.call('fetchGlsl', 'glitchImage.fs', (errF, imageFrag) => {
          img.mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2, 2),
            new THREE.RawShaderMaterial({
              uniforms: img.uniforms,
              vertexShader: imageShader,
              fragmentShader: imageFrag
            })
          );
          resolve(img);
        });
      });
    });
  });
}