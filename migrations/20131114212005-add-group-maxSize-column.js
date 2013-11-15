module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('group', 'max_size', {
      type: DataTypes.INTEGER,
      defaultValue: 3
    });
    done()
  },
  down: function(migration, DataTypes, done) {
    migration.removeColumn('group', 'max_size');
    done()
  }
}
