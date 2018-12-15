Template.glitchyGutter.onCreated(function() {
  this.expandGutter = new ReactiveVar(false);
  this.audioActive = new ReactiveVar(true);
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
    Session.set('gutterEvent', 'upload');
  },
  'change [data-action="glitchDropdown"]': function(e,t) {
    console.log(e.currentTarget.value)
    var glitchSelected = Glitches.findOne(e.currentTarget.value);
    if (glitchSelected) {
      Session.set('unloadGlitch', true);
      Session.set('glitchName', glitchSelected.glitchName)
    }
  }
});

Template.glitchyGutter.onDestroyed(function() {
  
});