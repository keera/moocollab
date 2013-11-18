(function() {
  "use strict";

  MC.Views.Alert = Backbone.View.extend({

    el: "#main",

    template: Handlebars.compile($("#alert").html()),

    render: function() {
      this.$(".alert").remove(); // Remove existing
      this.$el.prepend(this.template());
      return this;
    }

  });

})();
