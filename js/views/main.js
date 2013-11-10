(function () {
  "use strict";

  // Our top level main view
  MC.Views.Main = Backbone.View.extend({

    el: '#main',

    initialize: function() {
      this.render();
    },

    events: {
      'click .home': 'home',
      'click .about': 'about'
    },

    updateTab: function(current) {
      this.$('.navbar-nav li')
        .removeClass('active')
        .filter(function() {
          return $(this).children().attr('class') == current;
        })
        .addClass('active');
    },

    home: function() {
      this.updateTab('home');
      (new MC.Views.Home()).render();
    },

    about: function() {
      this.updateTab('about');
      (new MC.Views.About()).render();
    },

    render: function() {
      this.home();
      return this;
    }

  });


})();
