import express from "express";
import mysql from "mysql";
import {
  apiQueryResponse,
  apiResponse,
  music,
  musicProps,
} from "./types/types";

const app = express();
app.use(express.json());

const port = 8080;

export const connection = mysql.createConnection({
  host: "localhost",
  user: "jerome",
  password: "bdabccacbb",
  database: "lofi_moods",
});

connection.connect();

app.get("/", (req, res) => {
  res.send({ welcome: "Welcome to lofi moods api", status: "running" });
});

///       CREATE
app.put("/addMusic", (req, res) => {
  let musics: Array<music> = req.body;
  let processedResponse: Array<apiResponse<music>> = [];

  musics.forEach(async (item: music, index: number) => {
    let inserting = await insertIntoDb(item);
    if (inserting.error) {
      processedResponse.push({
        success: false,
        message: "music not added",
        data: item,
      });
    } else {
      processedResponse.push({
        success: true,
        message: "music added",
        data: { id: inserting.results.insertId, ...item },
      });
    }
    if (index === musics.length - 1) {
      res.send(processedResponse);
    }
  });

  async function insertIntoDb(item: music): Promise<apiQueryResponse> {
    return new Promise((resolve) =>
      connection.query(
        `INSERT INTO music(title, owner, link, mood) VALUES('${item.title}', '${item.owner}', '${item.owner}', '${item.mood}')`,
        (error, results, fields) =>
          resolve({ error: error, results: results, fields: fields })
      )
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

  let response: Array<apiQueryResponse> = [];

  let processedResponse: apiResponse<Array<any>>;
  let success = true;

  Object.keys(item).forEach(async (key: string, index: number) => {
    if (item[key as musicProps] !== "id") {
      let updating = await updateColumn(key as musicProps, item);
      console.log(updating.error);
      if (updating.error !== null) {
        success = false;
      }
      response.push(updating);
    }
  });

  if (!success) {
    processedResponse = {
      success: false,
      message: "something went wrong",
      data: response.map((item) => item.results),
    };
  } else {
    processedResponse = {
      success: true,
      message: "fields updated",
      data: response.map((item) => item.results),
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

app.delete("/deleteMusic", async (req, res) => {
  let id: number = req.body["id"];
  let response: apiQueryResponse = await new Promise((resolve) =>
    connection.query(
      `DELETE FROM music WHERE id = ${id}`,
      (error, results, fields) =>
        resolve({ error: error, results: results, fields: fields })
    )
  );
  let parsedResponse: apiResponse<number>;
  if (response.error) {
    parsedResponse = {
      success: false,
      message: "failed to delete music",
      data: response.results,
    };
  } else {
    parsedResponse = {
      success: true,
      message: "music deleted",
      data: response.results,
    };
  }

  res.send(parsedResponse);
});

app.listen(port, () => {
  console.log("listening on " + "http://localhost:" + port);
});
