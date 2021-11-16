import { decamelizeKeys } from "humps";
import config from "../config";
import { APIDetail, APIList, callApi, callApiWithToken } from "./base";

export interface APIItemToken {
  id: number;
  onSale: boolean;
  price: number;
  sellType: number;
  auction: APIAuction | null;
  collectible: APIItemCollectible;
  owner: number;
  ownerName: string;
  supply: number;
  tokenNumber: number;
  mintId: number;
}

export interface APIItemCollectible {
  id: number;
  contractAddress: string;
  file1?: string;
  files: string[];
  coverImg?: string;
  tokenAmt: number;
  tokenSold: number;
  title: string;
  description: string;
  tokenId: string;
  creator: number;
  creatorName: string;
  royalties: number;
  category: number;
  collaborators: APIItemCollaborator[];
  is360Video: boolean;
}

export interface APIItemCollaborator {
  id: number;
  item: number;
  user: number;
  walletToken: string;
  sharePercentage: number;
}

export interface APIAuction {
  id: number;
  startDate: Date;
  endDate: Date;
  startingBiddingPrice: number;
  currentBiddingPrice: number;
  highestBidderId: number | null;
}

export interface APIItemTokenDetail extends APIDetail<APIItemToken> {}
export interface APIItemTokenList extends APIList<APIItemToken> {}

// ON SALE

export const fetchOnSaleTokenList = async (
  token?: string,
  queryIds?: string,
  sortingParameter?: string
) => {
  let url = queryIds
    ? `${config.urls.token}?filter=${queryIds}`
    : `${config.urls.token}`;
  if (sortingParameter) {
    url += queryIds
      ? `&sort_by=${sortingParameter}`
      : `?sort_by=${sortingParameter}`;
  }
  if (token) {
    return callApiWithToken(url, token);
  }
  return callApi(url);
};

export const fetchOnSaleNextPage = async (url: string) => callApi(url);

export const fetchTokenDetail = async (tokenId: number, apiToken?: string) => {
  const url = `${config.urls.token}${tokenId}/`;
  if (apiToken) {
    return callApiWithToken(url, apiToken);
  }
  return callApi(url);
};

export const fetchSuperFeaturedTokenList = async () =>
  callApi(`${config.urls.token}?is_super_featured=True`);

export const fetchTopFeaturedTokenList = async () =>
  callApi(`${config.urls.token}?is_featured=True`);

export const fetchTopSellerTokenList = async () =>
  callApi(`${config.urls.token}?is_topseller=True`);

export type APIPurchaseInput = Pick<APIItemToken, "price">;
export type APIPurchaseResult = {
  newToken?: APIItemToken;
  oldToken: APIItemToken;
};
export const purchase = async (
  itemTokenId: number,
  apiToken: string,
  data: APIPurchaseInput
) =>
  callApiWithToken(
    `${config.urls.token}${itemTokenId}/purchase/`,
    apiToken,
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify(decamelizeKeys(data))
  );

export type APIPlaceBidInput = {
  auction: number;
  bidValue: number;
};
export const placeBid = async (
  itemTokenId: number,
  apiToken: string,
  data: APIPlaceBidInput
) =>
  callApiWithToken(
    `${config.urls.token}${itemTokenId}/place-bid/`,
    apiToken,
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify(decamelizeKeys(data))
  );

// USER TOKENS

export const fetchUserNextPage = async (url: string) => callApi(url);

export const fetchUserOwnedTokenList = async (id: number) =>
  callApi(`${config.urls.user}${id}/tokens/owned/`);

export const fetchUserOnSaleTokenList = async (id: number) =>
  callApi(`${config.urls.user}${id}/tokens/on-sale/`);

export const fetchUserCreatedTokenList = async (id: number) =>
  callApi(`${config.urls.user}${id}/tokens/created/`);

export const fetchUserLikedTokenList = async (id: number) =>
  callApi(`${config.urls.user}${id}/tokens/likes/`);

export type APIAuctionInput = Partial<
  Omit<APIAuction, "id" | "currentBiddingPrice" | "highestBidderId">
>;

export type APIItemCollaboratorInput = Partial<
  Omit<APIItemCollaborator, "id" | "item">
>;

// SELF TOKENS
export interface APIItemTokenUpdateInput
  extends Partial<
    Omit<
      APIItemToken,
      "id" | "auction" | "collectible" | "owner" | "ownerName" | "supply"
    >
  > {
  auction?: APIAuctionInput;
}

export const update = async (
  id: number,
  token: string,
  data: APIItemTokenUpdateInput
) =>
  callApiWithToken(
    `${config.urls.user}me/tokens/${id}/`,
    token,
    "PATCH",
    { "Content-Type": "application/json" },
    JSON.stringify(decamelizeKeys(data))
  );

export const finalizeAuction = async (itemTokenId: number, apiToken: string) =>
  callApiWithToken(
    `${config.urls.token}${itemTokenId}/finalize-auction/`,
    apiToken,
    "POST",
    { "Content-Type": "application/json" }
  );
