(function (){
  "use strict"

  MC.Router = Backbone.Router.extend({

    routes: {
      ""     : "home",
      "about": "about"
    },

    about: function() {
      (new MC.Views.About()).render();
    },

    home: function() {
      (new MC.Views.Home()).render();
    }

  });

})();
