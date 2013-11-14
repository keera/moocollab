var https = require('https');
var Sequelize = require("sequelize");
var settings = require('../settings');

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

function storeCourseData(provider_id) {
  // Makes an API call to json endpoint that returns all course related data
  var url = 'https://d1hpa2gdx2lr6r.cloudfront.net/maestro/api/topic/list2?unis=id%2Cname%2Cshort_name%2Cpartner_type%2Cfavicon%2Chome_link%2Cdisplay&topics=id%2Clanguage%2Cname%2Cshort_name%2Csubtitle_languages_csv%2Cself_service_course_id%2Csmall_icon_hover%2Clarge_icon%2Cshort_description&cats=id%2Cname%2Cshort_name&insts=id%2Cfirst_name%2Cmiddle_name%2Clast_name%2Cshort_name%2Cuser_profile__user__instructor__id&courses=id%2Cstart_day%2Cstart_month%2Cstart_year%2Cstatus%2Csignature_track_open_time%2Csignature_track_close_time%2Celigible_for_signature_track%2Cduration_string%2Chome_link%2Ctopic_id%2Cactive&__cf_version=1ced4a81bbd3312b7e48b191ae9bc8adf835fce6&__cf_origin=https%3A%2F%2Fwww.coursera.org';

  var data = '';

  https.get(url, function(res) {

    console.log("Got response: " + res.statusCode);

    res.on('data', function(chunk) {
      data += chunk;
    });

    res.on('end', function() {
      var content = JSON.parse(data);
      for (var i in content.topics) {
        var course_title = content.topics[i].name;
        course.findOrCreate({name: course_title},{provider_id: provider_id}).success(function(course, created){

          if (course) {
            console.log(created.name + ' already exists');
          } else if (created) {
            console.log('Course created: ' + course.name);
          } else {
            console.log('error');
          }
        }).error(function(error){
          console.log(error);
        });
      }
    });

  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });

}

provider.findOrCreate({name: 'Coursera'}).success(function(provider, created){
  var provider_name = 'Coursera';
  var provider_id = null;

  if (provider) {
    provider_id = provider.provider_id;
  } else if (created) {
    provider_id = created.provider_id;
  }

  if (provider_id) {
    storeCourseData(provider_id);
  }
}).error(function(error){
  console.log(error);
});

