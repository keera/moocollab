var Sequelize = require("sequelize");
var settings = require('../settings');

var sqlz = new Sequelize(settings.dbname, settings.dbuser, settings.dbpass, {
  dialect: 'mysql',
  omitNull: true
});

// Define models
var Course = sqlz.define('course', {
  course_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: Sequelize.STRING,
  provider_id: Sequelize.INTEGER
}, {
  freezeTableName: true,
  timestamps: false
});

var Provider = sqlz.define('provider', {
  provider_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false
});

var User = sqlz.define('user', {
  user_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  display_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  intro: Sequelize.TEXT,
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  status: Sequelize.TEXT,
  join_date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  freezeTableName: true,
  timestamps: false
});

var Group = sqlz.define('group', {
  group_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: Sequelize.STRING,
  create_date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  course_id: Sequelize.INTEGER
}, {
  freezeTableName: true,
  timestamps: false
});

var GroupUser = sqlz.define('group_user', {
  group_id: Sequelize.INTEGER,
  user_id: Sequelize.INTEGER,
  user_join_date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  user_confirm_send_date: Sequelize.DATE,
  user_confirm_date: Sequelize.DATE
}, {
  freezeTableName: true,
  timestamps: false
});

GroupUser.belongsTo(Group, {foreignKey: 'group_id'});
Course.belongsTo(Provider, {foreignKey: 'provider_id'});

module.exports.User = User;
module.exports.Course = Course;
module.exports.Provider = Provider;
module.exports.Group = Group;
module.exports.GroupUser = GroupUser;
module.exports.Sqlz = sqlz;

