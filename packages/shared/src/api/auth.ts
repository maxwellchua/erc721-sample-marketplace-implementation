import config from "../config";
import { callApi, callApiWithToken } from "./base";
import { APIUser } from "./users";

export interface APILoginInput {
  username: string;
  password: string;
}

export interface APILoginResult {
  token: string;
  user: APIUser;
}

export const login = async (data: APILoginInput) => {
  const { username, password } = data;
  return callApi(`${config.urls.auth}login/`, "POST", {
    Authorization: `Basic ${btoa(`${username}:${password}`)}`,
  });
};

export const logout = async (apiToken: string) =>
  callApiWithToken(`${config.urls.auth}logout/`, apiToken, "POST", {});
