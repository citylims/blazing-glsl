Template.glitchyGutter.onCreated(function() {
  this.expandGutter = new ReactiveVar(true);
  this.audioActive = new ReactiveVar(true);
  this.toggleUpload = new ReactiveVar(false);
  this.uploading = new ReactiveVar(false);
  this.autorun(() => {
    if (!this.expandGutter.get()) {
      console.log('close');
    	$('#gutter').animate({height: '20px'}, {duration: 250});
    } else {
      console.log('open');
      $('#gutter').animate({height: '70px'}, {duration: 250,});
    }
  });
});

Template.glitchyGutter.helpers({
  gutterExpand() {
    return Template.instance().expandGutter.get();
  },
  glitches() {
    return Glitches.find();
  },
  audioVizActive() {
    return Template.instance().audioActive.get();
  },
   isSelected: function () {
     return Session.equals('glitchName', this.glitchName) ? 'selected' : '';
   },
   isUpload: function() {
     return Template.instance().toggleUpload.get();
   },
   uploading: function(){
     return Template.instance().uploading.get();
   },
   computeY: function(y) {
     return (y * 3).tofixed(0);
   }
});

Template.glitchyGutter.events({
  'click [data-action="expandGutter"]': function(e,t) {
    t.expandGutter.set(!t.expandGutter.get());
  },
  'click [data-action="audioVizPlay"]': function(e,t) {
    Session.set('gutterEvent', 'audioVizPlay');
    t.audioActive.set(true)
  },
  'click [data-action="audioVizStop"]': function(e,t) {
    Session.set('gutterEvent', 'audioVizStop');
    t.audioActive.set(false)
  },
  'click [data-action="cam"]': function(e,t) {
    Session.set('gutterEvent', 'cam');
  },
  'click [data-action="upload"]': function(e,t) {
    t.toggleUpload.set(!t.toggleUpload.get());
    // Session.set('gutterEvent', 'upload');
  },
  'change [data-action="glitchDropdown"]': function(e,t) {
    // console.log(e.currentTarget.value)
    var glitchSelected = Glitches.findOne({glitchName: e.currentTarget.value});
    if (glitchSelected) {
      Session.set('unloadGlitch', true);
      Session.set('glitchName', glitchSelected.glitchName)
    }
  },
  'change #inputFile': function(e,t) {
    var file = document.getElementById('inputFile').files[0];
    if (!file) return;
    var metaContext = {text: 'test'};
    var uploader = new Slingshot.Upload('pigeonUpload', metaContext); 
    console.log('in')
    t.uploading.set(true);
    uploader.send(document.getElementById('inputFile').files[0], (err, downloadUrl) => {
      t.uploading.set(false);
      if (err) {
        alert('failed to upload')
      } else {
        console.log(downloadUrl);
        Session.set('uploadUrl', downloadUrl);
        // var updateParams = {
        //   fileName: file.name,
        //   fileType: file.type,
        //   dateModified: file.lastModifiedDate,
        //   url: downloadUrl
        // }
        //save in mongo? form for creating new pair?
      }
    });
  }
});

Template.glitchyGutter.onDestroyed(function() {
  
});