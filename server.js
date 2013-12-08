var Sequelize = require('./server/models');
var GroupAssign = require('./server/group_assign');
var express = require('express');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.bodyParser());
app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res) {
  res.status(200).sendfile('index.html');
});

// Group assignment
app.post('/signup', function(req, res) {
  GroupAssign.assign(req, res);
});

// Group confirmation
app.post('/confirm/:code', function(req, res) {
  var code = req.params.code;
  console.log(code);
  res.json(200, {msg: 'confirmed', data: code});
});

// Course search
app.get('/course/:name', function(req, res) {
  Sequelize.Course.findAll({
    include: [Sequelize.Provider],
    where: ["course.name LIKE ?", '%' + req.params.name + '%'],
    limit: 5}).success(function(courses) {
      res.json(200, courses);
  }).error(function(error) {
    console.log(error);
  });
});

app.listen(app.get('port'));
