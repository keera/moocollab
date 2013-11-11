(function () {
  "use strict";

  MC.Views.About = Backbone.View.extend({

    el: "#content",

    template: Handlebars.compile($("#about").html()),

    render: function() {
      this.$el.html(this.template());
      return this;
    }

  });

})();
