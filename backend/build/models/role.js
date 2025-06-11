'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.User, {
        foreignKey: 'roleId'
      });
    }
  }
  Role.init({
    roleName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Role'
  });
  return Role;
};