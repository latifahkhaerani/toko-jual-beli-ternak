const express = require("express");
const app = express();
const port = 3000;
const Controller = require("./controllers/controller");

app.set("view engine", "ejs");
express.urlencoded({
  extended: true,
});

app.get("/", Controller.home);
app.get("/register", Controller.formRegister);
app.post("/register", Controller.register);
app.get("/login", Controller.formLogin);
app.post("/login", Controller.login);
app.get("/logout", Controller.logout);
app.get("/stock", Controller.getStock);
app.get("/stock/add", Controller.formAdd);
app.post("/stock/add", Controller.addStock);
app.get("/stock/buy/:id", Controller.buy);
app.get("/stock/delete/:id", Controller.deleteStock);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
