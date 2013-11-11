module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable(
      'location',
      {
        location_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        }
    });
    done()
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('location');
    done()
  }
}
