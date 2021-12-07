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

  let response: apiQueryResponse = await new Promise((resolve) => {
    connection.query(
      `SELECT * FROM music WHERE mood = '${mood}'`,
      (error, results, fields) =>
        resolve({ error: error, results: results, fields: fields })
    );
  });

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
});

///       UPDATE
app.post("/updateMusic", async (req, res) => {
  let item: music = req.body;

  let response: apiQueryResponse = {
    error: null,
    results: "",
    fields: undefined,
  };

  let processedResponse: apiResponse<undefined>;
  let success = true;

  Object.keys(item).forEach(async (key: string, index: number) => {
    if ((await updateColumn(key as musicProps, item)).error) {
      success = false;
    }
  });

  if (response) {
    processedResponse = {
      success: false,
      message: "failed to update fields",
      data: undefined,
    };
  } else {
    processedResponse = {
      success: true,
      message: "fields updated",
      data: undefined,
    };
  }

  res.send(processedResponse);

  async function updateColumn(
    toUpdate: musicProps,
    item: music
  ): Promise<apiQueryResponse> {
    return await new Promise((resolve) =>
      connection.query(
        `UPDATE music SET ${toUpdate} = '${item[toUpdate]}' WHERE id = ${item.id}`,
        (error, results, fields) =>
          resolve({ error: error, results: results, fields: fields })
      )
    );
  }
});

app.listen(port, () => {
  console.log("listening on " + "http://localhost:" + port);
});
