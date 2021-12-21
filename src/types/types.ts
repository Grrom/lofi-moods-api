import { FieldInfo, MysqlError } from "mysql";

export type musicProps = "id" | "title" | "owner" | "link" | "mood";
export interface music {
  id?: number;
  title: string;
  owner: string;
  link: string;
  mood: string;
}

export interface mood {
  id?: number;
  mood: string;
}

export interface apiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface apiQueryResponse {
  error: MysqlError | null;
  results: any;
  fields: Array<FieldInfo> | undefined;
}
