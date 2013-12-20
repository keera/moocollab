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
      var getWarningMessage = function(remaining) {
        var num = Math.abs(remaining);
        var msg = (new String(num));
        msg += (num === 1) ? " character" : " characters";
        msg += (remaining >= 0) ? " remaining" : " overlimit";
        return msg;
      };

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

      $countdownEl.html(getWarningMessage(remaining));

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
        var $formLoaderEl = this.$('.processing-loader').show();
        var minDelay = 1000; // ms
        $formLoaderEl.addClass('form-processing');
        var options = {
          success: function(model, res, options) {
            var currTime = (new Date()).getTime();
            var diff = currTime - options.timeSent;
            // Play delay animation :)
            setTimeout(function() {
              $formLoaderEl.removeClass('form-processing');
              $formLoaderEl.hide();
              $('#myModal').modal('hide');
              (new MC.Views.Alert({type: 'signup-success'})).render();
            }, (diff < minDelay) ? minDelay - diff : 0);
          },
          error: function(model, res, options) {
            $formLoaderEl.removeClass('form-processing');
            $formLoaderEl.hide();
            alert("Something went wrong");
          },
          validate: false,
          timeSent: (new Date()).getTime()
        }
        newForm.save(data, options);
      }

    },

    render: function(options) {
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
            .addClass('autocomplete-loading');
          },
          complete: function(e) {
            $courseTypeaheadEl
            .removeClass('autocomplete-loading');
          }
        },
        limit: 5,
      });

      if (options && options.type) {
        (new MC.Views.Alert({type: options.type})).render();
      }

      return this;
    }

  });


})();
