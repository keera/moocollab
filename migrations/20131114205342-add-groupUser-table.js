module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable('group_user', {
      group_id: {
        type: DataTypes.INTEGER,
        references: 'group',
        referencesKey: 'group_id'
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: 'user',
        referencesKey: 'user_id'
      },
      user_join_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      user_confirm_send_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      user_confirm_date: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });
    done()
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('group_user');
    done()
  }
}
