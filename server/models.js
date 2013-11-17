var Sequelize = require("sequelize");
var settings = require('../settings');

var sqlz = new Sequelize(settings.dbname, settings.dbuser, settings.dbpass, {
  dialect: 'mysql'
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

// Set association
Course.belongsTo(Provider, {foreignKey: 'provider_id'});

module.exports.User = User;
module.exports.Course = Course;
module.exports.Provider = Provider;

