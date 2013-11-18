var Sequelize = require('./models');

// Create a group for the user
var createNewUserGroup = function(req, res, user_id, course_id) {
  Sequelize.Group.create({
    course_id: course_id
  }).success(function(group) {
    Sequelize.GroupUser.create({
      user_id: user_id,
      group_id: group.group_id
    }).success(function(groupUser) {
      res.send(200, "Success: Create new group with user");
    }).error(function(error) {
      console.log(error);
      res.send(500, "Error: Create group user");
    });
  }).error(function(error) {
    console.log(error);
    res.send(500, "Error: Create group");
  });
}

// Add user to an existing group
var addToExistingGroup = function(req, res, user_id,
  group_id, group_size) {

  Sequelize.GroupUser.create({
    user_id: user_id,
    group_id: group_id
  }).success(function(groupUser) {
    Sequelize.GroupUser.count({
      where: ["group_id = ?", group_id]
    }).success(function(count) {
      console.log("New user count: " + count);
      if (count == group_size) {
        // Our email code
        console.log("Woot, got a group. Sending emails");
      }
    }).error(function(error) {
      // Log count fail
      console.log(error);
    });
    res.send(200, "Success: Add to existing group");
  }).error(function(error) {
    // Log these
    console.log(error);
    res.send(500, "Error: Add to existing group");
  });
}

// Find available groups
var findAvailableGroups = function(req, res, user_id, course_id) {
  var query = "SELECT `group`.group_id, COUNT(*) AS numUsers, `group`.max_size " +
    "FROM group_user JOIN `group` " +
    "ON group_user.group_id = `group`.group_id " +
    "WHERE `group`.course_id = :course_id " +
    "GROUP BY `group`.group_id " +
    "HAVING COUNT(*) < `group`.max_size " +
    "ORDER BY numUsers DESC";

  Sequelize.Sqlz.query(query, null, {raw: true}, {
    course_id: course_id
  }).success(function(groups) {
    if (groups.length) {
      console.log('Groups found!');
      console.log(groups);
      var joinGroup = groups[0]; // Get first one
      var group_id = joinGroup.group_id;
      var group_maxSize = joinGroup.max_size;

      addToExistingGroup(req, res, user_id, group_id, group_maxSize);
    } else {
      console.log('No groups. Time to create!');
      createNewUserGroup(req, res, user_id, course_id);
    }
  }).error(function(error) {
    res.send(500, 'Error: Find existing group');
  });
}

// Add user to a group
var addToGroup = function(req, res, user_id, course_name) {
  Sequelize.Course.find({
    where: {name: course_name}
  }).success(function(course) {
    if (course) {
      // Is user in existing group?
      Sequelize.GroupUser.find({
        include: [Sequelize.Group],
        where: ["group_user.user_id = ? AND group.course_id = ?",
          user_id,
          course.course_id
        ]}).success(function(groupUser) {
          if (groupUser) {
            res.send(409, "Conflict: User already in a group for that class");
          } else {
            findAvailableGroups(req, res, user_id, course.course_id);
          }
      });
    } else {
      res.send(404, 'Not found: Course not found');
    }
  }).error(function(error) {
    res.send(500, 'Error: Find course');
  });
}

// Kick off signup process
var assign = function(req, res) {
  var userEmail = req.body.email;
  var userIntro = req.body.intro;
  var userDisplayName = req.body.display_name;
  var userCourse = req.body.course;
  var user_id;

  Sequelize.User.find({
    where: {email: userEmail}
  }).success(function(user) {
    if (user) {
      user_id = user.user_id;
      addToGroup(req, res, user_id, userCourse);
    } else {
      Sequelize.User.create({
        email: userEmail,
        intro: userIntro,
        display_name: userDisplayName
      }).success(function(user) {
        addToGroup(req, res, user.user_id, userCourse);
      }).error(function(error) {
        console.log(error);
        res.send(500, 'Error: Create user');
      });
    }
  }).error(function(error) {
    res.send(500, 'Error: Find user');
  });
}

module.exports.assign = assign;
