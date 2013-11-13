var Sequelize = require("sequelize");
var settings = require('./settings');

var sqlz = new Sequelize(settings.dbname, settings.dbuser, settings.dbpass, {
  dialect: 'mysql'
});

sqlz.query("SELECT * FROM user").success(function(myTableRows) {
  console.log(myTableRows)
})

console.log(sqlz);
