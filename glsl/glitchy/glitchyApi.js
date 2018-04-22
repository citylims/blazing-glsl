function debounce(callback, duration) {
  var timer;
  return function(event) {
    clearTimeout(timer);
    timer = setTimeout(function(){
      callback(event);
    }, duration);
  };
}

function normalizeVector2(vector) {
  vector.x = (vector.x / document.body.clientWidth) * 2 - 1;
  vector.y = - (vector.y / window.innerHeight) * 2 + 1;
};

GlitchyApi = {
  debounce,
  normalizeVector2
}