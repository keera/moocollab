module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('group_user', 'user_confirm_id', {
      type: DataTypes.STRING,
      allowNull: true
    });
    done()
  },
  down: function(migration, DataTypes, done) {
    migration.removeColumn('group_user', 'user_confirm_id');
    done()
  }
}
