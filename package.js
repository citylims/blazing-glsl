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
  api.use('session');
  api.use('templating', 'client');
  api.mainModule('blazingApi.js');
  api.addFiles([
    'client/spider/spider.html',
    'client/spider/spider.js',
    'client/spider/spiderEffect.js',
    'client/glitchy/glitchy.html',
    'client/glitchy/glitchy.js',
    'client/glitchy/glitchyGutter.html',
    'client/glitchy/glitchyGutter.js',
    'client/glitchy/glitchCam.html',
    'client/glitchy/glitchCam.js',
    'client/glitchy/glitchImage.js',
    'client/glitchy/glitchEffect.js'
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
    'glsl/spider/shaders.js',
    'server/methods.js'
  ], 'server');
});
