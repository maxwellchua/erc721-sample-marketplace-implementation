import { decamelizeKeys } from "humps";

import config from "../config";
import { APIList, APISearchParams, callApi, callApiWithToken } from "./base";

export interface APIUser {
  id: number;
  isSuperuser: boolean;
  commissionRate: number;
  address: string;
  profileImage: string | null;
  coverImage: string | null;
  description: string;
  firstName: string;
  lastName: string;
  displayName: string;
  twitter: string;
  instagram: string;
  messenger: string;
}

export interface APIUserList extends APIList<APIUser> {}
export interface APIUserListSearchParams extends APISearchParams {}

export const fetchMyUserInfo = async (token: string) =>
  callApiWithToken(`${config.urls.user}me/`, token, "GET", {
    Authorization: "",
  });

export const fetchUserList = async (params?: APIUserListSearchParams) =>
  callApi(config.urls.user, "GET", {}, "", true, true, params);

export const fetchUserDetail = async (id: number) =>
  callApi(`${config.urls.user}${id}/`);

export const createUser = async (data: {}) =>
  callApi(
    config.urls.user,
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify(decamelizeKeys(data))
  );

export interface APIUserUpdateInput
  extends Partial<
    Omit<
      APIUser,
      "id" | "address" | "displayName" | "coverImage" | "profileImage"
    >
  > {
  profileImage?: string;
}

export const editMyUserInfo = async (
  token: string,
  data: APIUserUpdateInput
) => {
  const formData = new FormData();
  if (data.profileImage) {
    formData.append("profile_image", data.profileImage);
  }

  formData.append("first_name", data.firstName || "");
  formData.append("last_name", data.lastName || "");
  formData.append("description", data.description || "");
  formData.append("instagram", data.instagram || "");
  formData.append("messenger", data.messenger || "");
  formData.append("twitter", data.twitter || "");

  return callApiWithToken(
    `${config.urls.user}me/`,
    token,
    "PATCH",
    { Authorization: "" },
    formData
  );
};

export const editMyAvatar = async (token: string, data: FormData) =>
  callApiWithToken(
    `${config.urls.user}me/`,
    token,
    "PATCH",
    { Authorization: "" },
    data
  );

export const editCoverImage = async (token: string, data: FormData) =>
  callApiWithToken(
    `${config.urls.user}me/`,
    token,
    "PATCH",
    { Authorization: "" },
    data
  );

export type APIUpdateWalletTokenInput = {
  walletToken: string;
};

export const editWalletToken = async (
  apiToken: string,
  data: APIUpdateWalletTokenInput
) =>
  callApiWithToken(
    `${config.urls.user}me/`,
    apiToken,
    "PATCH",
    { "Content-Type": "application/json" },
    JSON.stringify(decamelizeKeys(data))
  );

export const subscribe = async (data: {}) =>
  callApi(
    config.urls.subscribe,
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify(decamelizeKeys(data)),
    true,
    false
  );
