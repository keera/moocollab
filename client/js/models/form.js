(function () {
  "use strict";

  MC.Models.Form = Backbone.Model.extend({

    default: {
      email: '',
      course: '',
      display_name: '',
      intro: '',
    },

    validate: function(attrs, options) {
      var errors = {};

      if (attrs.course.length == 0) {
        errors.course = 'Course is required';
      }

      if (attrs.email.length == 0) {
        errors.email = 'Email is required';
      } else if (!/^\S+@\S+$/.test(attrs.email)) {
        errors.email = 'Please enter a valid email';
      }

      if (attrs.display_name.length == 0) {
        errors.display_name = 'Display name is required';
      }

      if (attrs.intro.length == 0) {
        errors.intro = 'Intro is required';
      } else if (attrs.intro.length > 256) {
        errors.intro = 'Intro exceeds 256 char limit';
      }

      return errors;
    },

    url: 'signup'

  });

})();
