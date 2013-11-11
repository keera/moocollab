module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable(
      'user',
      {
        user_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        display_name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        intro: DataTypes.TEXT,
        email: {
          type: DataTypes.STRING,
          allowNull: false
        },
        status: DataTypes.TEXT,
        join_date: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        },
        location_id: {
          type: DataTypes.INTEGER,
          references: "location",
          referencesKey: "location_id"
        }
      });
    done()
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('user');
    done()
  }
}
