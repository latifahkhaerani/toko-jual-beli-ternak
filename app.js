// testing
const express = require("express");
const app = express();
const port = 3000;
const Controller = require("./controllers/controller");
const session = require("express-session");

const { formatRupiah } = require("./helpers/rupiah");

app.locals.formatRupiah = formatRupiah;
app.set("view engine", "ejs");
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(
  session({
    secret: "moomart-rahasia-peternakan", // kunci bebas
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set true jika menggunakan HTTPS
  }),
);

app.get("/", Controller.home);
app.get("/register", Controller.formRegister);
app.post("/register", Controller.register);
app.get("/login", Controller.formLogin);
app.post("/login", Controller.login);
app.get("/logout", Controller.logout);
app.get("/cart", Controller.cart);
app.get("/stock", Controller.getStock);
app.get("/stock/add", Controller.formAdd);
app.post("/stock/add", Controller.addStock);
app.get("/stock/buy/:id", Controller.buy);
app.get("/products/", Controller.productDetail); // perbaiki tambah id
app.get("/stock/delete/:id", Controller.deleteStock);
app.get("/transactions/history", Controller.transactionHistory);
app.get("/seller/dashboard", Controller.sellerDashboard);

app.listen(port, () => {
  console.log(`I <3 ${port} More`);
});
