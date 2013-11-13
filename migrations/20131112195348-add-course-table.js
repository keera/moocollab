module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable('course', {
      course_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: DataTypes.STRING,
      provider_id: {
        type: DataTypes.INTEGER,
        references: 'provider',
        referencesKey: 'provider_id'
      }
    });
    done()
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('course');
    done()
  }
}
