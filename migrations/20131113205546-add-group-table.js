module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable('group', {
      group_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      create_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      course_id: {
        type: DataTypes.INTEGER,
        references: 'course',
        referencesKey: 'course_id'
      }
    });
    done()
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('group');
    done()
  }
}
