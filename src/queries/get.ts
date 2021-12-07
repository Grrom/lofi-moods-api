import { connection } from "..";
import { apiQueryResponse, apiResponse, music } from "../types/types";

export async function getMusic(mood: string): Promise<apiQueryResponse> {
  let prom: Promise<apiQueryResponse> = new Promise((resolve) => {
    connection.query(
      `SELECT * FROM music WHERE mood = '${mood}'`,
      (error, results, fields) =>
        resolve({ error: error, results: results, fields: fields })
    );
  });

  return prom;
}
