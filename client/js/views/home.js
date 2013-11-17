(function () {
  "use strict";

  MC.Views.Home = Backbone.View.extend({
    el: "#content",

    template: Handlebars.compile($("#home").html()),

    events: {
      'click #submit': 'submitForm',
      "keydown textarea[name='intro']": 'updateCharLimit',
    },

    updateCharLimit: function() {
      var length = this.$("textarea[name='intro']")
        .val()
        .length;
      var remaining = 256 - length;
      var $countdownEl = this.$('.countdown');

      if (remaining < 128 && remaining >= 64) {
        $countdownEl
          .removeClass('label-info label-danger')
          .addClass('label-warning');
      } else if (remaining < 64) {
        $countdownEl
          .removeClass('label-info label-warning')
          .addClass('label-danger');
      } else {
        $countdownEl
          .removeClass('label-warning label-danger')
          .addClass('label-info');
      }

      $countdownEl.html(remaining + ' characters remaining');
    },

    submitForm: function() {
      var fields = {};

      fields.email = this.$("input[name='email']");
      fields.course = this.$("input[name='course']");
      fields.display_name = this.$("input[name='displayname']");
      fields.intro = this.$("textarea[name='intro']");

      var data = {
        course: fields.course.val().trim(),
        email: fields.email.val().trim(),
        display_name: fields.display_name.val().trim(),
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
        var options = {
          success: function(model,res, options) {
            console.log('win');
          },
          error: function(model, res, options) {
            console.log('fail');
          },
          validate: false
        }
        newForm.save(data, options);
      }

    },

    render: function() {
      this.$el.html(this.template());
      var $courseTypeaheadEl = this.$("input[name='course'].twitter-typeahead");

      // https://github.com/twitter/typeahead.js/issues/492
      $courseTypeaheadEl.typeahead({
        name: 'courses',
        valueKey: 'name',
        template: Handlebars.compile("<p>{{name}} <span class='label label-default'>{{provider.name}}</p>"),
        remote: {
          url: 'course/%QUERY',
          beforeSend: function(e) {
            $courseTypeaheadEl
            .addClass('autocomplete-loading');},
          complete: function(e) {
            $courseTypeaheadEl
            .removeClass('autocomplete-loading');}
        },
        limit: 5,
      });

      return this;
    }

  });


})();
