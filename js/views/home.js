(function () {
  "use strict";

  MC.Views.Home = Backbone.View.extend({
    el: "#content",

    template: Handlebars.compile($("#home").html()),

    render: function() {
      this.$el.html(this.template());
      return this;
    }

  });


})();
