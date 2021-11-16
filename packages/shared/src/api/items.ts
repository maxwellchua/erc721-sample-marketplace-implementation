import { decamelizeKeys } from "humps";
import config from "../config";
import { callApi, callApiWithToken } from "./base";

export const fetchItemList = async (token?: string, queryIds?: string) => {
  const url = queryIds
    ? `${config.urls.item}on-sale/?filter=${queryIds}`
    : `${config.urls.item}on-sale/`;
  if (token) {
    return callApiWithToken(url, token);
  }
  return callApi(url);
};

export const fetchItemDetail = async (id: number, token?: string) => {
  const url = `${config.urls.item}${id}`;
  if (token) {
    return callApiWithToken(url, token);
  }
  return callApi(url);
};

export const checkItemLikeStatus = async (
  id: number,
  token: string,
  toggle?: boolean
) => {
  const url = `${config.urls.item}${id}/like-toggle/`;
  const method = toggle ? "POST" : "GET";
  return callApiWithToken(url, token, method);
};

export const fetchTopFeaturedItemList = async () =>
  callApi(`${config.urls.item}?is_featured=True`);

export const fetchTopSellerItemList = async () =>
  callApi(`${config.urls.item}?is_topseller=True`);

export const createItem = async (token: string, data: FormData) =>
  callApiWithToken(
    `${config.urls.user}me/items/`,
    token,
    "POST",
    { Authorization: "" },
    data
  );

export const mintItemTokens = async (
  token: string,
  id: number,
  data: FormData
) =>
  callApiWithToken(
    `${config.urls.user}me/items/${id}/mint/`,
    token,
    "POST",
    { Authorization: "" },
    data
  );

export const updateItem = async (
  token: string,
  id: number,
  data: Record<string, string | number>
) =>
  callApiWithToken(
    `${config.urls.user}me/items/${id}/`,
    token,
    "PATCH",
    { "Content-Type": "application/json" },
    JSON.stringify(decamelizeKeys(data))
  );

export const deleteItem = async (token: string, id: number) =>
  callApiWithToken(`${config.urls.user}me/items/${id}/`, token, "DELETE");
