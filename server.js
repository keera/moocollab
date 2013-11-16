var Sequelize = require("sequelize");
var settings = require('./settings');
var express = require('express');
var app = express();

var sqlz = new Sequelize(settings.dbname, settings.dbuser, settings.dbpass, {
  dialect: 'mysql'
});

// Define models
var course = sqlz.define('course', {
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

var provider = sqlz.define('provider', {
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

// Set association
course.belongsTo(provider, {foreignKey: 'provider_id'});

// Set the public folder
app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res) {
  res.status(200).sendfile('index.html');
});

// Course search
app.get('/course/:name', function(req, res) {
  course.findAll({
    include: [provider],
    where: ["course.name LIKE ?", '%' + req.params.name + '%'],
    limit: 5}).success(function(courses) {
    res.json(200,courses);
  });
});

app.listen(3000);
