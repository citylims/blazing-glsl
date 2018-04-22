import GlitchShaders from '../glsl/shaders.js'

Meteor.methods({
  fetchGlsl(fileName) {
    if (fileName === "glitchEffect.fs") {
      return GlitchShaders.effectFrag();
    } else if (fileName === "glitchEffect.vs") {
      return GlitchShaders.effectShader();
    } else if (fileName === "glitchImage.fs") {
      return GlitchShaders.imageFrag();
    } else {
      return GlitchShaders.imageShader();
    }
  },
});

