Package.describe({
  name: 'pigeonworks:blazing-glsl',
  version: '0.0.1',
  summary: '',
  git: '',
  documentation: 'README.md'
});

Npm.depends({
  glslify: '6.1.1',
  three: '0.90.0'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.4.1');
  api.use('ecmascript');
  api.use('tracker');
  api.use('templating', 'client');
  api.mainModule('blazingApi.js');
  api.addFiles([
    'client/glitchy.html',
    'client/glitchy.js',
    'client/glitchImage.js',
    'client/glitchEffect.js'
  ], 'client');
  api.addAssets([
    'private/glitchEffect.fs',  
    'private/glitchEffect.vs', 
    'private/glitchImage.fs',  
    'private/glitchImage.vs',
  ], ['client', 'server']);
  api.addFiles([
    'glsl/glitchy/shaders.js',
    'glsl/glitchy/glitchyApi.js',
    'server/methods.js'
  ], 'server');
});
