
(function (window, undefined) {
  "use strict"
  // Create our global app object
  var MC = {
    Views : {},
    Models: {},
    router: null
  }

  MC.init = function() {
    MC.router = new MC.Router();
    Backbone.history.start();

    new MC.Views.Main();
  }

  window.MC = MC;

})(window);
