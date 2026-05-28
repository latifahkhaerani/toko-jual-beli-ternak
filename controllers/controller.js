const {
  Livestock,
  UserProfile,
  User,
  Transaction,
} = require("../models/index");
const bcrypt = require("bcryptjs");

class Controller {
  // Home => tampilan utama
  static async home(req, res) {
    try {
      res.render("home");
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // Registernya get dan post
  static async formRegister(req, res) {
    try {
      res.render("register");
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
  static async register(req, res) {
    try {
      const { email, password, role, fullName, phoneNumber } = req.body;

      // buat data user untuk dimasukkin ke tabel usernya
      const newUser = await User.create({ email, password, role });

      // pakek id user baru/new usernya untuk buat userProfilnya
      await UserProfile.create({
        fullName,
        phoneNumber,
        UserId: newUser.id, // Foreign Key nya ke user baru
      });

      res.redirect("/login");
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // Login get dan postnya
  static async formLogin(req, res) {
    try {
      res.render("login");
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // cari usernya melalui email
      const user = await User.findOne({ where: { email } });

      if (user) {
        const passwordBcrypt = bcrypt.compareSync(password, user.password); // Membandingkan teks vs hash

        if (passwordBcrypt) {
          // Jika cocok, set session login seperti biasa
          req.session.userId = user.id;
          req.session.userRole = user.role;

          return res.redirect("/stock");
        }
      }

      return res.send("Email atau Password Salah");
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) return res.send(err.message);
        res.redirect("/login");
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // stock
  static async getStock(req, res) {
    try {
      // kita ambil search dan notifikasinya
      const { search, notification } = req.query;

      // buat konfigurasi Eager Loading dasar
      let options = {
        include: {
          model: User,
          include: {
            model: UserProfile, // Nested Eager Loading untuk mengambil nama lengkap Peternak
          },
        },
        order: [["id", "ASC"]], // Mengurutkan berdasarkan ID terkecil secara default
      };

      if (search) {
        options.where = {
          type: {
            [Op.iLike]: `%${search}%`,
          },
        };
      }

      // Panggil Static Method yang sudah kita buat di model Livestock
      const livestocks = await Livestock.getAvailableLivestocks(options);

      res.render("stock", {
        livestocks,
        notification,
        userRole: req.session.userRole,
      });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  // add stock
  static async formAdd(req, res) {
    try {
      // PROTEKSI: Jika bukan Peternak, tendang balik ke /stock
      if (req.session.userRole !== "Seller") {
        return res.redirect(
          "/stock?notification=Akses ditolak! Hanya Peternak yang boleh menambah stok.",
        );
      }

      // Ambil pesan error dari query parameter jika ada
      const { errors } = req.query;
      res.render("addStock", { errors });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
  static async addStock(req, res) {
    try {
      const { name, type, price, gender } = req.body;

      // Ambil ID dari peternak yang sedang login melalui session
      const UserId = req.session.userId;

      if (!UserId) {
        return res.send(
          "Anda harus login terlebih dahulu untuk menambah stok!",
        );
      }

      // ambil naam file dari multer jika ada file yang di unggah
      let imageUrl = null;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      console.log(req.file);
      console.log(imageUrl, "=========>");

      // Proses pembuatan data baru menggunakan UserId dari session
      await Livestock.create({
        name,
        type,
        price,
        gender,
        UserId,
        imageUrl: imageUrl,
      });

      res.redirect("/stock");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errMessages = error.errors.map((err) => err.message);
        return res.redirect(
          `/stock/add?errors=${encodeURIComponent(JSON.stringify(errMessages))}`,
        );
      }
      console.log(error);
      res.send(error.message);
    }
  }
  static async buy(req, res) {
    try {
      // PROTEKSI: Jika bukan Pembeli, tidak boleh memproses transaksi
      if (req.session.userRole === "Seller") {
        return res.redirect(
          "/stock?notification=Akses ditolak! Hanya akun Pembeli yang dapat melakukan transaksi.",
        );
      }
      const { id } = req.params; // ID dari hewan ternak yang diklik beli

      // DINAMIS: Ambil ID Pembeli langsung dari session user yang sedang aktif
      const buyerId = req.session.userId;

      // Proteksi jika user mencoba tembak hit route langsung tanpa login
      if (!buyerId) {
        return res.send(
          "Anda harus login terlebih dahulu untuk membeli ternak!",
        );
      }

      // Cari data ternaknya untuk mengambil data harga (price)
      const animal = await Livestock.findByPk(id);
      if (!animal) {
        return res.send("Data ternak tidak ditemukan!");
      }

      // Masukkan data ke tabel junction Transactions (Many-to-Many)
      await Transaction.create({
        UserId: buyerId, // ID Pembeli dinamis dari session
        LivestockId: animal.id, // ID Ternak yang dibeli
        totalPaid: animal.price, // Menyimpan nominal harga saat transaksi terjadi
        receiptNumber: `REC-${Date.now()}`, // Membuat nomor resi unik otomatis menggunakan timestamp
      });

      // Update status livestock menjadi 'Terjual' agar tidak muncul lagi di list stok tersedia
      await animal.update({ status: "Terjual" });

      res.redirect("/stock");
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
  static async deleteStock(req, res) {
    try {
      const { id } = req.params; // ID ternak yang akan dihapus

      // Menggunakan PROMISE CHAINING
      Livestock.destroy({
        where: { id },
      }).then(() => {
        res.redirect(
          "/stock?notification=Hewan ternak berhasil dihapus dari sistem!",
        );
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  // history transaksi
  static async transactionHistory(req, res) {
    try {
      // Ambil ID user yang sedang login dari session
      const buyerId = req.session.userId;
      const userRole = req.session.userRole;

      // Proteksi: Pastikan user sudah login
      if (!buyerId) {
        return res.redirect("/login?error=Silakan login terlebih dahulu!");
      }

      if (userRole === "Seller") {
        return res.redirect(
          "/stock?notification=Akses ditolak! Halaman riwayat pembelian hanya untuk akun Pembeli.",
        );
      }

      // Query ke tabel Transaction dengan Eager Loading ke model Livestock
      const transactions = await Transaction.findAll({
        where: { UserId: buyerId },
        include: {
          model: Livestock, // Mengambil data detail ternak yang dibeli
        },
        order: [["createdAt", "DESC"]], // Menampilkan transaksi terbaru di atas
      });

      res.render("transactionHistory", { transactions });
    } catch (error) {
      res.send(error);
    }
  }

  // dasbord si saller nya
  static async sellerDashboard(req, res) {
    try {
      const sellerId = req.session.userId;
      const userRole = req.session.userRole;

      // Proteksi: Pastikan user sudah login
      if (!sellerId) {
        return res.redirect("/login?error=Silakan login terlebih dahulu!");
      }

      // Proteksi: Hanya Peternak yang boleh mengakses halaman ini
      if (userRole === "Buyer") {
        return res.redirect(
          "/stock?notification=Akses ditolak! Halaman Dashboard Penjual hanya untuk akun Peternak.",
        );
      }

      // Query Menggunakan Nested Eager Loading untuk melacak pembeli ternak
      const myStocks = await Livestock.findAll({
        where: { UserId: sellerId },
        include: {
          model: Transaction,
          include: {
            model: User,
            include: {
              model: UserProfile, // Mengambil profil lengkap pembeli jika ada transaksi
            },
          },
        },
        order: [["id", "ASC"]],
      });

      res.render("sellerDashboard", { myStocks });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }
}

module.exports = Controller;
