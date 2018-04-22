import GlitchShaders from '../glsl/glitchy/shaders.js'

Meteor.methods({
  fetchGlsl(fileName) {
  	switch(fileName) {
  		case "glitchEffect.fs": return GlitchShaders.effectFrag(); break;
  		case "glitchEffect.vs": return GlitchShaders.effectShader(); break;
  		case "glitchImage.fs": return GlitchShaders.imageFrag(); break;
  		case "glitchImage.vs": return GlitchShaders.imageShader(); break;
    }
  }
});

