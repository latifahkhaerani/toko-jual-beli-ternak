"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Masukkan data ke tabel Users terlebih dahulu
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          id: 1,
          email: "peternak@moomart.com",
          password: "password123", // Di real application nanti pakai bcrypt, untuk simulasi ini string biasa dulu aman
          role: "Peternak",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: "pembeli@gmail.com",
          password: "password123",
          role: "Pembeli",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );

    // 2. Masukkan data ke tabel UserProfiles dengan UserId yang cocok
    await queryInterface.bulkInsert(
      "UserProfiles",
      [
        {
          fullName: "Pak Eko Peternak Jaya",
          phoneNumber: "081234567890",
          address: "Banda Aceh",
          UserId: 1, // Menyambung ke id 1
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
    // Menghapus data seeder jika di-undo (db:seed:undo) dengan urutan terbalik
    await queryInterface.bulkDelete("UserProfiles", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
