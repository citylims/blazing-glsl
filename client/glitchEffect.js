import THREE from 'three';
import { Promise } from 'meteor/promise';

export const createEffect = function(texture) {
  return new Promise(function(resolve, reject) {
    let effect = {};
    effect.uniforms = {
      time: {
        type: 'f',
        value: 0
      },
      mousePosition: {
        type: 'f',
        value: 0
      },
      resolution: {
        type: 'v2',
        value: new THREE.Vector2(document.body.clientWidth, window.innerHeight)
      },
      texture: {
        type: 't',
        value: texture,
      },
    };
    effect.render = (time, pos) => {
      if (effect.uniforms) {
        effect.uniforms.time.value += time;
        if (pos) {
          effect.uniforms.mousePosition.value = pos;
        }
      }
    }
    effect.resize = () => {
      if (effect.uniforms) {
        effect.uniforms.resolution.value.set(document.body.clientWidth, window.innerHeight);
      }
    }
    
    Meteor.call('fetchGlsl', 'glitchEffect.vs', (errV, effectShader) => {
      Meteor.call('fetchGlsl', 'glitchEffect.fs', (errF, effectFrag) => {
        effect.mesh = new THREE.Mesh(
          new THREE.PlaneBufferGeometry(2, 2),
          new THREE.RawShaderMaterial({
            uniforms: effect.uniforms,
            vertexShader: effectShader,
            fragmentShader: effectFrag,
          })
        );
        resolve(effect)
      });
    });
  });
}
