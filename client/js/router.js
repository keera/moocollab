(function (){
  "use strict"

  MC.Router = Backbone.Router.extend({

    routes: {
      ""     : "home",
      "about": "about",
      "faq"  : "faq",
      "alert/:type": "alert"
    },

    about: function() {
      (new MC.Views.About()).render();
    },

    home: function() {
      (new MC.Views.Home()).render();
    },

    faq: function() {
      (new MC.Views.FAQ()).render();
    },

    alert: function(type) {
      var options = {
        type: type
      };
      (new MC.Views.Home()).render(options);
    }

  });

})();
