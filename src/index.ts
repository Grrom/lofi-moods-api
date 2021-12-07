import express from "express";
import mysql from "mysql";
import util from "util";
import {
  apiQueryResponse,
  apiResponse,
  music,
  musicProps,
} from "./types/types";

const app = express();
app.use(express.json());

const port = 3000;

export const connection = mysql.createConnection({
  host: "localhost",
  user: "jerome",
  password: "bdabccacbb",
  database: "lofi_moods",
});

connection.connect();

app.get("/", (req, res) => {
  res.send("Welcome to lofi moods api");
});

///       CREATE
app.post("/addMusic", (req, res) => {
  req.body.forEach((item: music) => insertIntoDb(item));

  function insertIntoDb(item: music) {
    connection.query(
      `INSERT INTO music(title, owner, link, mood) VALUES('${item.title}', '${item.owner}', '${item.owner}', '${item.mood}')`,
      (error, results, fields) => {
        if (error) throw error;
        res.send(results);
      }
    );
  }
});

///       READ
app.get("/getMusic", async (req, res) => {
  let mood = req.query.mood as string;

  let response: apiQueryResponse = await getMusic(mood);

  let processedResponse: apiResponse<Array<music>>;
  if (response.error) {
    processedResponse = {
      success: false,
      message: "query failed",
      data: response.results,
    };
  } else {
    processedResponse = {
      success: true,
      message: "query success",
      data: response.results,
    };
  }

  res.send(processedResponse);

  async function getMusic(mood: string): Promise<apiQueryResponse> {
    let prom: Promise<apiQueryResponse> = new Promise((resolve) => {
      connection.query(
        `SELECT * FROM music WHERE mood = '${mood}'`,
        (error, results, fields) =>
          resolve({ error: error, results: results, fields: fields })
      );
    });

    return prom;
  }
});

///       UPDATE
app.post("/updateMusic", (req, res) => {
  console.log("got post");
  console.log(req.body);

  let item: music = req.body;

  Object.keys(item).forEach((key: string, index: number) => {
    updateColumn(key as musicProps, item);
  });

  function updateColumn(toUpdate: musicProps, item: music) {
    util;
    connection.query(
      `UPDATE music SET ${toUpdate} = '${item[toUpdate]}' WHERE id = ${item.id}`,
      (error, results, fields) => {
        if (error) throw error;
      }
    );
  }

  res.send();
});

app.listen(port, () => {
  console.log("listening on " + "http://localhost:" + port);
});
