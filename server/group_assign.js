var Sequelize = require('./models');
var Sendgrid = require('sendgrid');
var dateFormat = require('dateformat');
var crypto = require('crypto');
// Email env values
var sendgrid_username = process.env.SENDGRID_USERNAME;
var sendgrid_password = process.env.SENDGRID_PASSWORD;
var to = process.env.DEFAULT_TO;

Sendgrid = Sendgrid(sendgrid_username, sendgrid_password);

// Get unique hash based on values
var getUserGroupHash = function(user_id, group_id) {
  var shash = crypto.createHash('sha1');
  shash.update((user_id + '&') + group_id);
  return shash.digest('hex');
}

// Mark sent emails
var markConfirmationSent = function(data) {
  var recipients = data.recipients;

  recipients.map(function(val) {
    var groupUser = val.model;
    if (!groupUser) return;
    groupUser.updateAttributes({
      user_confirm_send_date: dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
    }).success(function() {
      console.log("Mark confirmation succeeded");
    }).error(function() {
      console.log("Mark confirmation failed");
    });
  });
}

// Final email
var sendPostConfirmationEmail = function(data) {
  console.log("WOOOOT");
  console.log(data);
};

var sendConfirmationEmail = function(data) {
  var recipients = data.recipients ||
    [{email: "admin@moocollab.com", display_name: "boss"}];
  var course_name = data.course_name || "Introduction to Taijitsu";
  var toEmails = recipients.map(function(val) {
    return val.email;
  });
  var displayNames = recipients.map(function(val) {
    return val.display_name;
  });
  var confirmationIds = recipients.map(function(val) {
    return val.user_confirm_id;
  });

  var email = new Sendgrid.Email();
  var fromEmail = 'admin@moocollab.com';
  var html = '<p>Hey there %display_name%,</p>' +
  '<p>Great news! We just matched you with study group ' +
  'for the course <strong>' + course_name + '</strong>.</p>' +
  '<p>If you wish the join the group, please ' +
  '<strong>confirm</strong> by clicking the the link below.</p>' +
  '<a href="http://www.moocollab.com/confirm/%user_confirm_id%">' +
  'Yes, I want to join the group!</a>' +
  '<p>If not, no problem! Just ignore this message. No hard feelings :)</p>' +
  '<p>Thanks,</p>'+
  '</p>MooCollab</p>';

  email.addTo(toEmails);
  email.setFrom(fromEmail);
  email.setSubject('We found a study group for you!');
  email.setHtml(html);
  email.setUniqueArgs({
    group_id: data.group_id,
    course_name: course_name
  });
  // Add substitutions
  email.addSubVal("%display_name%", displayNames);
  email.addSubVal("%user_confirm_id%", confirmationIds);

  email.addHeaders({'X-Sent-Using': 'SendGrid-API'});
  email.addHeaders({'X-Transport': 'web'});
  Sendgrid.send(email, function(err, json) {
    if (err) {
      return console.error(err);
    }
    data.recipients = recipients;
    markConfirmationSent(data);
    console.log(json);
  });
};

var emailGroup = function(req, res, data) {
  var group_id = data.group_id || 0;

  Sequelize.GroupUser.findAll({
    include: [Sequelize.User],
    where: ["group_user.group_id = ?", group_id]
  }).success(function(groupUsers) {
    var recipients = [];
    for (var i in groupUsers) {
      var group_user = groupUsers[i];
      var user = group_user.user;
      recipients.push({
        email: user.email,
        display_name: user.display_name,
      });
    }
    data.recipients = recipients;
    sendPostConfirmationEmail(data);
  }).error(function(error) {
    // Failed to get users
    console.log(error);
  });
};
// Send email to group
var emailGroupConfirmation = function(req, res, data) {
  var group_id = data.group_id || 0;

  Sequelize.GroupUser.findAll({
    include: [Sequelize.User],
    where: ["group_user.group_id = ? AND group_user.user_confirm_send_date IS NULL",
      group_id]
  }).success(function(groupUsers) {
    var recipients = [];
    for (var i in groupUsers) {
      var group_user = groupUsers[i];
      var user = group_user.user;
      recipients.push({
        model: group_user,
        email: user.email,
        display_name: user.display_name,
        user_confirm_id: group_user.user_confirm_id
      });
    }
    data.recipients = recipients;
    sendConfirmationEmail(data);
  }).error(function(error) {
    // Failed to get users
    console.log(error);
  });
};

// Create a group for the user
var createNewUserGroup = function(req, res, data) {
  var user_id = data.user_id || 0;
  var course_id = data.course_id || 0;

  Sequelize.Group.create({
    course_id: course_id
  }).success(function(group) {
    Sequelize.GroupUser.create({
      user_id: user_id,
      group_id: group.group_id,
      user_confirm_id: getUserGroupHash(user_id, group.group_id)
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



// Add user to an existing group
var addToExistingGroup = function(req, res, data) {
  var user_id = data.user_id || 0;
  var group_id = data.group_id || 0;
  var group_size = data.group_size || 0;

  Sequelize.GroupUser.create({
    user_id: user_id,
    group_id: group_id,
    user_confirm_id: getUserGroupHash(user_id, group_id)
  }).success(function(groupUser) {
    Sequelize.GroupUser.count({
      where: ["group_id = ?", group_id]
    }).success(function(count) {
      console.log("New user count: " + count);
      // We have a group
      if (+count === +group_size) {
        emailGroupConfirmation(req, res, data);
      }
    }).error(function(error) {
      // Log count fail
      console.log(error);
    });
    res.json(200, {Success: "Add to existing group"});
  }).error(function(error) {
    // Log these
    console.log(error);
    res.json(500, {error: "Add to existing group"});
  });
};

// Find available groups
var findAvailableGroups = function(req, res, data) {
  var user_id = data.user_id || 0;
  var course_id = data.course_id || 0;
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
      // Get first one
      var joinGroup = groups[0];
      data.group_id = joinGroup.group_id;
      data.group_size = joinGroup.max_size;
      addToExistingGroup(req, res, data);
    } else {
      console.log('No groups. Time to create!');
      createNewUserGroup(req, res, data);
    }
  }).error(function(error) {
    res.send(500, 'Error: Find existing group');
  });
};

// Add user to a group
var addToGroup = function(req, res, data) {
  var user_id = data.user_id || 0;
  var course_name = data.course_name || "test";

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
        ]
      }).success(function(groupUser) {
        if (groupUser) {
          console.log("User already in a group for that class");
          res.json(409, {error: "User already in a group for that class"});
        } else {
          data.course_id = course.course_id;
          findAvailableGroups(req, res, data);
        }
      });
    } else {
      res.json(404, {error: 'Course not found'});
    }
  }).error(function(error) {
    res.json(500, {error: "Course find failed"});
  });
};

// Send final email in assignment lifecycle
var verifyGroup = function(req, res, data) {
  var group_id = data.group_id || 0;
  var group_size = data.group_size || 0;
  // Count total confirmations
  Sequelize.GroupUser.count({
    where: ["group_id = ? AND user_confirm_date IS NOT NULL", group_id]
  }).success(function(count) {
    // We have an offical group!
    if (+count === +group_size) {
      emailGroup(req, res, {group_id: group_id});
    }
  }).error(function(error) {
    // Log count fail
    console.log(error);
  });
};

// Kick off assignment process
var assign = function(req, res) {
  var userEmail = req.body.email;
  var userIntro = req.body.intro;
  var userDisplayName = req.body.display_name;
  var userCourse = req.body.course;
  var data = {course_name: userCourse};

  Sequelize.User.find({
    where: {email: userEmail}
  }).success(function(user) {
    if (user) {
      data.user_id = user.user_id;
      addToGroup(req, res, data);
    } else {
      Sequelize.User.create({
        email: userEmail,
        intro: userIntro,
        display_name: userDisplayName
      }).success(function(user) {
        data.user_id = user.user_id;
        addToGroup(req, res, data);
      }).error(function(error) {
        console.log(error);
        res.json(500, {error: 'Create user failed'});
      });
    }
  }).error(function(error) {
    res.json(500, {error: 'Find user failed'});
  });
};

// Kick off confirmation process
var confirm = function(req, res) {
  var user_confirm_id = req.params.code;
  // Get group_user associated
  Sequelize.GroupUser.find({
    include: [Sequelize.Group],
    where: ["user_confirm_id = ? AND user_confirm_date IS NULL",
      user_confirm_id
  ]}).success(function(groupUser) {
    if (!groupUser) {
      console.log(groupUser);
      res.json(500, {error: 'Confirm user failed'});
      return console.error("no group user");
    }
    var group = groupUser.group;
    groupUser.updateAttributes({
      user_confirm_date: dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
    }).success(function(groupUser) {
      var group_id = groupUser.group_id;
      var user_id = groupUser.user_id;
      var data = {
        group_id: group_id,
        group_size: group.max_size
      };
      res.json(200, {success: 'Confirm user success'});
      verifyGroup(req, res, data);
    }).error(function() {
      res.json(500, {error: 'Confirm user failed'});
    });
  }).error(function(error) {
    res.json(500, {error: 'Confirm user failed'});
  });
};

module.exports.assign = assign;
module.exports.confirm = confirm;
