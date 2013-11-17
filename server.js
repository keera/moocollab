var settings = require('./settings');
var Sequelize = require('./server/models');
var Signup = require('./server/signup');
var express = require('express');
var app = express();

app.use(express.bodyParser());
// Set the public folder
app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res) {
  res.status(200).sendfile('index.html');
});

app.post('/signup', function(req, res) {
  Signup(req, res);
});

// Course search
app.get('/course/:name', function(req, res) {
  Sequelize.Course.findAll({
    include: [Sequelize.Provider],
    where: ["course.name LIKE ?", '%' + req.params.name + '%'],
    limit: 5}).success(function(courses) {
      res.json(200, courses);
  });
});

app.listen(3000);
