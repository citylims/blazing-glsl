Session.setDefault('camUrl', false);
Template.glitchCam.onCreated(function(){  
  Slingshot.fileRestrictions("myFileUploads", {
    allowedFileTypes: ["image/png", "image/jpeg", "image/gif", "application/pdf"],
    maxSize: null
  });
  this.uploader = new ReactiveVar(false);
  this.file = new ReactiveVar(false);
  this.canvas = new ReactiveVar(false);
  this.track = new ReactiveVar(false);
});

Template.glitchCam.helpers({
  imageUrl: function() {
    return Template.instance().file.get();
  },
  isUploading: function() {
    return Boolean(Template.instance().uploader.get())
  },
  progress: function () {
    if (Template.instance().uploader.get()) {
      var uploader = Template.instance().uploader.get();
      if (uploader.progress()) {
        return Math.round(uploader.progress() * 100);
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
});

Template.glitchCam.events({
  'click [data-action="confirm"]': function(e,t) {
    var metaContext = {text: 'testCam'};
    var uploader = new Slingshot.Upload('pigeonUpload', metaContext)
    t.uploader.set(uploader);
    var active = t.track.get();
    if (active) {
      active.stop();
    }
    var canvas = Template.instance().canvas.get();
    if (!canvas) {
      console.log('no canvas');
      return;
    }
    canvas.toBlob((blob) =>{
      uploader.send(blob, (err, url) => {
        if (err) {
          console.log(err);
        } else {
          var updateParams = {
            fileName: blob.size,
            fileType: blob.type,
            dateModified: new Date(),
            url: url
          }
          Session.set('camUrl', url);
        }
      }); // uploader
    }); //blob
  }
});

Template.glitchCam.onRendered(function(){
  var video = document.querySelector('video');
  var canvas;
  var inst = Template.instance();

  // use MediaDevices API
  // docs: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  if (navigator.mediaDevices) {
    // access web cam
    navigator.mediaDevices.getUserMedia({video: true})
    // after permission:
      .then(function(stream) {
        var track = stream.getTracks()[0];  // if only one media track
        inst.track.set(track);
        video.srcObject = stream;
        // video.src = window.URL.createObjectURL(stream); is depricated
        video.addEventListener('click', () => {
          var img = document.querySelector('#photoPreview');
          var context;
          var width = video.offsetWidth;
          var height = video.offsetHeight;
          var display = $('#glitchCamDisplay').get()[0];

          display.width = width;
          display.height = height;
          // canvas = canvas || document.createElement('canvas');
          // canvas.width = width;
          // canvas.height = height;
          inst.canvas.set(display);
          console.log(display);
          context = display.getContext('2d');
          context.drawImage(video, 0, 0, width, height);

          img.src = display.toDataURL('image/png');
          // document.body.appendChild(img);
          //set file
          inst.file.set(img.src);
          
          //turn off the webcam;
          var track = stream.getTracks()[0];  // if only one media track
          // track.stop();
        });
      })
      // permission denied:
      .catch(function(error) {
        console.log('No Permission');
      });
  }
});

Template.glitchCam.onDestroyed(function() {
  var active = Template.instance().track.get()
  if (active) {
    active.stop();
  }
});