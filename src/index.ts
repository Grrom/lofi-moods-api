import express from "express";
import mysql from "mysql";
import cors from "cors";
import {
  apiQueryResponse,
  apiResponse,
  mood,
  music,
  musicProps,
} from "./types/types";

const app = express();
app.use(express.json());
app.use(cors());

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
app.put("/addMusic", async (req, res) => {
  let music: music = req.body;
  let processedResponse: apiResponse<music>;

  let inserting = await insertIntoDb(music);

  if (inserting.error) {
    processedResponse = {
      success: false,
      message: "music not added",
      data: inserting.results,
    };
  } else {
    processedResponse = {
      success: true,
      message: "music added",
      data: { id: inserting.results.insertId, ...music },
    };
  }

  res.send(processedResponse);

  async function insertIntoDb(item: music): Promise<apiQueryResponse> {
    return new Promise((resolve) =>
      connection.query(
        `INSERT INTO music(title, owner, link, mood) VALUES('${item.title}', '${item.owner}', '${item.link}', '${item.mood}')`,
        (error, results, fields) =>
          resolve({ error: error, results: results, fields: fields })
      )
    );
  }
});

app.put("/addMood", async (req, res) => {
  let mood: string = req.body.mood;
  let processedResponse: apiResponse<mood>;

  let inserting = await insertIntoDb(mood);

  if (inserting.error) {
    processedResponse = {
      success: false,
      message: "mood not added",
      data: inserting.results,
    };
  } else {
    processedResponse = {
      success: true,
      message: "mood added",
      data: mood,
    };
  }

  res.send(processedResponse);

  async function insertIntoDb(mood: string): Promise<apiQueryResponse> {
    return new Promise((resolve) =>
      connection.query(
        `INSERT INTO moods(mood) VALUES('${mood}')`,
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
      `SELECT * FROM music WHERE mood = '${mood}' ORDER BY dateCreated DESC`,
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

app.get("/getMoods", async (req, res) => {
  let response: apiQueryResponse = await new Promise((resolve) => {
    connection.query(`SELECT * FROM moods `, (error, results, fields) =>
      resolve({ error: error, results: results, fields: fields })
    );
  });

  let processedResponse: apiResponse<Array<string>>;

  if (response.error) {
    processedResponse = {
      success: false,
      message: "Failed to query moods",
      data: response.results,
    };
  } else {
    processedResponse = {
      success: true,
      message: "Moods queried successfully",
      data: response.results.map((result: { mood: mood }) => result.mood),
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
      if (updating.error !== null) {
        success = false;
      }
      response.push(updating);
    }
    if (index === Object.keys(item).length - 1) {
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
    }
  });

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

app.delete("/deleteMood", async (req, res) => {
  let mood: mood = req.body["mood"];
  let response: apiQueryResponse = await new Promise((resolve) => {
    connection.query(`DELETE FROM music WHERE mood = '${mood}'`);
    connection.query(
      `DELETE FROM moods WHERE mood = '${mood}'`,
      (error, results, fields) =>
        resolve({ error: error, results: results, fields: fields })
    );
  });
  let parsedResponse: apiResponse<number>;
  if (response.error) {
    parsedResponse = {
      success: false,
      message: "failed to delete mood",
      data: response.results,
    };
  } else {
    parsedResponse = {
      success: true,
      message: "mood deleted",
      data: response.results,
    };
  }

  res.send(parsedResponse);
});

app.listen(port, () => {
  console.log("listening on " + "http://localhost:" + port);
});
