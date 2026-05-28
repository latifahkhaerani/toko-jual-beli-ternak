"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          email: "lala@lalacantik.com",
          password: await bcrypt.hash("password123", 10),
          role: "Seller",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "elshad@ganteng.com",
          password: await bcrypt.hash("password123", 10),
          role: "Buyer",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );

    await queryInterface.bulkInsert(
      "UserProfiles",
      [
        {
          fullName: "Lala Elshad",
          phoneNumber: "081234567890",
          address: "Banda Aceh",
          UserId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fullName: "Elshad Lala",
          phoneNumber: "089876543210",
          address: "Aceh Besar",
          UserId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("UserProfiles", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
