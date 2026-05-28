"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1. One-to-One: User memiliki satu UserProfile
      User.hasOne(models.UserProfile, {
        foreignKey: "UserId",
      });

      // 2. One-to-Many: User (Peternak) bisa memiliki banyak Livestock
      User.hasMany(models.Livestock, {
        foreignKey: "UserId",
      });

      // 3. Many-to-Many: User (Pembeli) bisa membeli banyak Livestock lewat tabel Transaction
      User.belongsToMany(models.Livestock, {
        through: models.Transaction,
        foreignKey: "UserId",
      });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
