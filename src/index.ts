import express from "express";
import mysql from "mysql";

const app = express();
const port = 3000;

const connection = mysql.createConnection({
  host: "localhost",
  user: "jerome",
  password: "bdabccacbb",
  database: "lofi_moods",
});

connection.connect();

app.get("/music", (req, res) => {
  connection.query(
    `SELECT * FROM music WHERE mood = '${req.query.mood}'`,
    (error, results, fields) => {
      if (error) throw error;
      res.send(results);
    }
  );
});

app.listen(port, () => {
  console.log("listening");
});
