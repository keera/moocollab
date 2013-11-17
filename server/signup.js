var Sequelize = require('./models');

var inExistingGroup = function(user_id, course_name) {
  Sequelize.Course.find({where: {name: course_name}}).success(function(course) {
    if (course) {
      // Check if user is in existing group
      // Join group, group_user
      // If so, send error message
      // else
        // Placement time!
      return true;
    } else {
      // Send an error message
      return false;
    }
  });
}

var signUp = function(req, res) {

  var userEmail = req.body.email;
  var userIntro = req.body.intro;
  var userDisplayName = req.body.display_name;
  var userCourse = req.body.course;

  Sequelize.User.find({where: {email: userEmail}}).success(function(user) {
    var user_id;

    if (user) {
      user_id = user.user_id;
      inExistingGroup(user_id, userCourse);
    } else {
      User.create({
        email: userEmail,
        intro: userIntro,
        display_name: userDisplayName
      }).success(function(user) {
        if (user) {
          user_id = user.user_id;
          inExistingGroup(user_id, userCourse);
        } else {
          console.log('error');
        }
      });
    }
  });

}


module.exports = signUp;
