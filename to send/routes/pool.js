var mysql = require("mysql");
var pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bank1",
  connectionLimit: 100,
});

module.exports = pool;
