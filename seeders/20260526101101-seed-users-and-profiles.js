"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          email: "peternak@moomart.com",
          password: "password123",
          role: "Peternak",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "pembeli@gmail.com",
          password: "password123",
          role: "Pembeli",
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
          fullName: "Pak Eko Peternak Jaya",
          phoneNumber: "081234567890",
          address: "Banda Aceh",
          UserId: 1, // Menyambung ke id 1 di sesuaikan id nya
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fullName: "Budi Pembeli Sukses",
          phoneNumber: "089876543210",
          address: "Aceh Besar",
          UserId: 2, // Menyambung ke id 2
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
