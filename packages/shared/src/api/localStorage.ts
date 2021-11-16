import localforage from "localforage";
import config from "../config";

// Side effects Services
export function getAuthToken(): Promise<string | null> {
  return localforage.getItem(config.tokenKey);
}

export function setAuthToken(token: string) {
  return localforage.setItem(config.tokenKey, token);
}

export function removeAuthToken() {
  return localforage.removeItem(config.tokenKey);
}
