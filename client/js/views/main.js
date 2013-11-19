(function () {
  "use strict";

  // Our top level main view
  MC.Views.Main = Backbone.View.extend({

    el: '#main',

    events: {
      'click .home': 'updateHomeTab',
      'click .about': 'updateAboutTab'
    },

    initialize: function() {
      this.updateHomeTab();
    },

    updateTab: function(current) {
      this.$('.navbar-nav li')
        .removeClass('active')
        .filter(function() {
          return $(this).children().attr('class') == current;
        })
        .addClass('active');
    },

    updateHomeTab: function() {
      this.updateTab('home');
    },

    updateAboutTab: function() {
      this.updateTab('about');
    },

  });

})();
