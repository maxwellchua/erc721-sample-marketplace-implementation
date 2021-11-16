import { camelizeKeys } from "humps";
import { fetchDedupe as fetch } from "fetch-dedupe";

import config from "../config";

function offlineResponse() {
  console.debug("[DEBUG]", "You are offline.");
  return "You are offline";
}

export type TokenType = string;
export type HeadersWithAuthorization = HeadersInit & {
  Authorization?: string;
};
export type APIResponse = { response: { entities?: any } };

export function getFullUrl(endpoint: string): string {
  if (endpoint.indexOf("https://") >= 0 || endpoint.indexOf("http://") >= 0) {
    return endpoint;
  }
  return endpoint.indexOf(config.urls.api) === -1
    ? `${config.urls.api}${endpoint}`
    : endpoint;
}

// Fetches an API response and normalizes the result JSON according to schema.
// This makes every API response have the same shape, regardless of how nested it was.
export async function callApi(
  endpoint: string,
  method = "GET",
  headers: HeadersWithAuthorization = {},
  body: BodyInit = "",
  camelize = true,
  errorStringify = true,
  searchParams?: APISearchParams
): Promise<APIResponse | Blob> {
  const fullUrl = getFullUrl(endpoint);
  const params: RequestInit = {
    method,
    credentials: "include",
    headers: {
      ...headers,
    },
  };

  const url = new URL(fullUrl);

  if (searchParams) {
    Object.keys(searchParams).forEach((key) =>
      url.searchParams.append(key, searchParams[key] as string)
    );
  }

  if (
    method === "PATCH" ||
    method === "POST" ||
    method === "PUT" ||
    method === "DELETE"
  ) {
    params.body = body;
  }

  const response = await fetch(url, params);

  if (response.status < 100 || response.status >= 500) {
    throw new Error(offlineResponse());
  }

  if (response.status === 204) {
    return { response: {} };
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    let json: {} = response.data;

    if (camelize) {
      json = camelizeKeys(json);
    }

    if (!response.ok) {
      if (errorStringify) throw new Error(JSON.stringify(json));
      throw json;
    }

    return {
      response: {
        entities: json,
      },
    };
  }
  // For non-JSON type responses, just return the data.
  return response.data;
}

export async function callApiWithToken(
  endpoint: string,
  token: TokenType,
  method = "GET",
  headers: HeadersWithAuthorization = {},
  body: BodyInit = "",
  camelize = true,
  errorStringify = true,
  searchParams?: APISearchParams
) {
  const tokenHeaders: HeadersWithAuthorization = { ...headers };
  if (token) {
    tokenHeaders.Authorization = `Token ${token}`;
  }
  return callApi(
    endpoint,
    method,
    tokenHeaders,
    body,
    camelize,
    errorStringify,
    searchParams
  );
}

// Convenience methods

export type APIDetail<T> = T;

export interface APIList<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface APISearchParams {
  [k: string]: string | string[] | number | boolean | undefined;
}
