(function () {
  "use strict";

  MC.Views.Home = Backbone.View.extend({
    el: "#content",

    template: Handlebars.compile($("#home").html()),

    events: {
      'click #submit': 'submitForm',
      "keydown textarea[name='intro']": 'updateCharLimit'
    },

    updateCharLimit: function() {
      var length = this.$("textarea[name='intro']")
        .val()
        .length;
      var remaining = 256 - length;

      if (remaining < 128 && remaining >= 64) {
        this.$('.countdown')
          .removeClass('label-info label-danger')
          .addClass('label-warning');
      } else if (remaining < 64) {
        this.$('.countdown')
          .removeClass('label-info label-warning')
          .addClass('label-danger');
      } else {
        this.$('.countdown')
          .removeClass('label-warning label-danger')
          .addClass('label-info');
      }

      this.$('.countdown').html(remaining + ' characters remaining');
    },

    submitForm: function() {
      var fields = {};

      fields.email = this.$("input[name='email']");
      fields.course = this.$("input[name='course']");
      fields.location = this.$("input[name='location']");
      fields.displayname = this.$("input[name='displayname']");
      fields.intro = this.$("textarea[name='intro']");

      var data = {
        course: fields.course.val().trim(),
        location: fields.location.val().trim(),
        email: fields.email.val().trim(),
        displayname: fields.displayname.val().trim(),
        intro: fields.intro.val().trim()
      };

      var newForm = new MC.Models.Form(data);
      var errors = newForm.validate(data);
      var containsErrors = false;

      for (var k in fields) {
        var formField = fields[k].parent();
        if (errors[k]) {
          containsErrors = true;
          formField.addClass('has-error');
        } else {
          formField.removeClass('has-error');
          formField.addClass('has-success');
        }
      }

      if (!containsErrors) {
        alert("submit!");
      }

    },

    render: function() {
      this.$el.html(this.template());
      return this;
    }

  });


})();
