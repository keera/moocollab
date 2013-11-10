(function () {
  "use strict";

  MC.Models.Form = Backbone.Model.extend({

    default: {
      email: '',
      course: '',
      location: '',
      displayname: '',
      intro: '',
    },

    validate: function(attrs, options) {
      var errors = {};

      if (attrs.course.length == 0) {
        errors.course = 'Course is required';
      }

      if (attrs.location.length == 0) {
        errors.location = 'Location is required';
      }

      if (attrs.email.length == 0) {
        errors.email = 'Email is required';
      } else if (!/^\S+@\S+$/.test(attrs.email)) {
        errors.email = 'Please enter a valid email';
      }

      if (attrs.displayname.length == 0) {
        errors.displayname = 'Display name is required';
      }

      if (attrs.intro.length == 0) {
        errors.intro = 'Intro is required';
      } else if (attrs.intro.length > 256) {
        errors.intro = 'Intro exceeds 256 char limit';
      }

      return errors;
    },

  });

})();
