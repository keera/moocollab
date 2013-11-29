var Sequelize = require('./models');
var Sendgrid = require('sendgrid');
// Email env values
var sendgrid_username = process.env.SENDGRID_USERNAME;
var sendgrid_password = process.env.SENDGRID_PASSWORD;
var to = process.env.DEFAULT_TO;

Sendgrid = Sendgrid(sendgrid_username, sendgrid_password);

var sendConfirmationEmail = function(recipients) {
  var toEmails = recipients.map(function(val) {
    return val.email;
  });
  var displayNames = recipients.map(function(val) {
    return val.display_name;
  });

  var email = new Sendgrid.Email();
  var html = '<p>Hey there %display_name%,</p>' +
  '<p>Great news! We just matched you with study group ' +
  'for the course <strong>Introduction to Ninjitsu</strong>.</p>' +
  '<p>If you wish the join the group, please ' +
  '<strong>confirm</strong> by clicking the the link below.</p>' +
  '<a href="http://www.moocollab.com">Yes, I want to join the group!</a>' +
  '<p>If not, no problem! Just ignore this message. No hard feelings :)</p>' +
  '<p>Thanks,</p>'+
  '</p>MooCollab</p>';
  email.addTo(toEmails);
  email.setFrom('lingramming@gmail.com');
  email.setSubject('We found a study group for you!');
  email.setHtml(html);
  email.setUniqueArgs({
    group_id: '1789',
    course_name: 'Introduction to Ninjitsu'
  });
  email.addSubVal("%display_name%", displayNames);
  email.addHeaders({'X-Sent-Using': 'SendGrid-API'});
  email.addHeaders({'X-Transport': 'web'});
  Sendgrid.send(email, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
  });
};

// Create a group for the user
var createNewUserGroup = function(req, res, user_id, course_id) {
  Sequelize.Group.create({
    course_id: course_id
  }).success(function(group) {
    Sequelize.GroupUser.create({
      user_id: user_id,
      group_id: group.group_id
    }).success(function(groupUser) {
      res.json(200, {Success: "Create new group with user"});
    }).error(function(error) {
      console.log(error);
      res.send(500, "Error: Create group user");
    });
  }).error(function(error) {
    console.log(error);
    res.send(500, "Error: Create group");
  });
};

// Send email to group
var emailGroupConfirmation = function(req, res, group_id) {
  Sequelize.GroupUser.findAll({
    include: [Sequelize.User],
    where: ["group_user.group_id = ? AND group_user.user_confirm_send_date IS NULL",
      group_id]
  }).success(function(groupUsers) {
    var recipients = [];
    for (var i in groupUsers) {
      var user = groupUsers[i].user;
      recipients.push({
        email: user.email,
        display_name: user.display_name
      });
    }
    sendConfirmationEmail(recipients);
  }).error(function(error) {
    // Failed to get users
    console.log(error);
  });
};

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
      // We have a group
      if (count == group_size) {
        emailGroupConfirmation(req, res, group_id);
      }
    }).error(function(error) {
      // Log count fail
      console.log(error);
    });
    res.json(200, {Success: "Add to existing group"});
  }).error(function(error) {
    // Log these
    console.log(error);
    res.send(500, "Error: Add to existing group");
  });
};

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
};

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
};

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
};

module.exports.assign = assign;
