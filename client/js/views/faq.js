(function() {
  "use strict";

  MC.Views.FAQ = Backbone.View.extend({

    el: "#content",

    template: Handlebars.compile($("#faq").html()),

    render: function() {
      this.$el.html(this.template());
      return this;
    }

  });

})();
