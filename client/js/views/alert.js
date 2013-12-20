(function() {
  "use strict";

  MC.Views.Alert = Backbone.View.extend({

    el: "#main",

    template: '',

    initialize: function(options) {
      var type = options.type || 'default';
      if (type === 'confirm-success') {
        this.template = Handlebars.compile($("#alert-confirm-success").html());
      } else {
        this.template = Handlebars.compile($("#alert-signup-success").html());
      }
    },

    render: function() {
      this.$(".alert").remove(); // Remove existing
      this.$el.prepend(this.template());
      return this;
    }

  });

})();
