var Sequelize = require('./models');

var createUserGroup = function(user_id, course_id) {
  console.log("Calling group creation!");
  Sequelize.Group.create({course_id: course_id}).success(function(group) {
    if (group) {
      var group_id = group.group_id;
      Sequelize.GroupUser.create({
        user_id: user_id,
        group_id: group_id
      }).success(function(groupUser) {
        if (groupUser) {
          console.log("group has been created for you");
        } else {
          console.log("Failed to create group user");
        }
      });
    }
  });
}

var findOrCreateGroup = function(user_id, course_id) {
  Sequelize.Sqlz.query("SELECT `group`.group_id, COUNT(*) AS numUsers, `group`.max_size FROM group_user JOIN `group` ON group_user.group_id = `group`.group_id WHERE `group`.course_id = :course_id GROUP BY `group`.group_id HAVING COUNT(*) < `group`.max_size ORDER BY numUsers DESC", null, {raw: true}, {course_id: course_id}).success(function(groups) {
  // If there are available groups
  if (groups.length) {
    // Get the first one
    console.log('groups found!');
    console.log(groups);
    var joinGroup = groups[0];
    var group_id = joinGroup.group_id;
    var group_currSize = joinGroup.numUsers;
    var group_maxSize = joinGroup.max_size;

    Sequelize.GroupUser.create({
      user_id: user_id,
      group_id: group_id
    }).success(function(groupUser) {
      if (groupUser) {
        console.log("You've been added to group " + group_id);
        Sequelize.GroupUser.count({where: ["group_id = ?", group_id]}).success(function(count) {
          console.log("New user count: " + count);
          if (count == group_maxSize) {
            console.log("Woot, got a group. Sending emails");
          }
        })
      } else {
        console.log("Failed to add to group");
      }
    }).error(function(error) {
      console.log(error);
    });
  } else {
    console.log('No groups. Time to create!');
    createUserGroup(user_id, course_id);
  }
}).error(function(error) {
  console.log(error);
});
}

var inExistingGroup = function(user_id, course_name) {
  Sequelize.Course.find({where: {name: course_name}}).success(function(course) {
    if (course) {
      // Check if user is in existing group
      Sequelize.GroupUser.find({
        include: [Sequelize.Group],
        where: ["group_user.user_id = ? AND group.course_id = ?",
          user_id,
          course.course_id
        ]}).success(function(groupUser) {
          if (groupUser) {
            console.log("Sorry, you're already in a group for that class");
          } else {
            // Placement Attempt
            findOrCreateGroup(user_id, course.course_id);
          }
      });
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
      Sequelize.User.create({
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
