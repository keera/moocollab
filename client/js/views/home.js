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

      var $locationTypeaheadEl = this.$("input[name='location'].twitter-typeahead");
      var $courseTypeaheadEl = this.$("input[name='course'].twitter-typeahead");

      $locationTypeaheadEl.typeahead({
        name: 'cities',
        template: Handlebars.compile("<p>{{value}} <span class='glyphicon glyphicon-globe'></span></p>"),
        remote: {
          url: 'http://gd.geobytes.com/AutoCompleteCity?callback=?&q=%QUERY',
          beforeSend: function(e) {
            $locationTypeaheadEl
            .addClass('autocomplete-loading');},
          complete: function(e) {
            $locationTypeaheadEl
            .removeClass('autocomplete-loading');},
          filter: function(res) {
            // Geobytes returns empty object on no-result
            // Gets mistaken by typeahead as a valid result
            if (res.length > 0 && res[0].length)
              return res;
            return [];
          }
        },
        limit: 5,
      });

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
