import { APIResponse } from "api/base";
import {
  APIItemToken,
  APIItemTokenDetail,
  APIItemTokenList,
  APIItemTokenUpdateInput,
  APIPlaceBidInput,
  APIPurchaseInput,
  APIPurchaseResult,
} from "api/tokens";
import {
  _async,
  _await,
  asMap,
  Model,
  model,
  modelFlow,
  objectMap,
  prop,
  modelAction,
} from "mobx-keystone";

import api from "../api";
import ItemToken from "./models/ItemToken";

@model("monofu/TokenStore")
export default class TokenStore extends Model({
  onSaleArrayMap: prop<[string, ItemToken][]>(() => []),
  superFeaturedMap: prop(() => objectMap<ItemToken>()),
  topFeaturedMap: prop(() => objectMap<ItemToken>()),
  topSellerMap: prop(() => objectMap<ItemToken>()),
  userItemTokenMap: prop(() => objectMap<ItemToken>()),
  userNextPage: prop<string | null>(null),
  onSaleNextPage: prop<string | null>(null),
}) {
  get onSaleMap() {
    return asMap(this.onSaleArrayMap);
  }

  @modelAction
  setOnSaleMap(itemToken: APIItemToken) {
    const mapItem = new ItemToken(itemToken);
    this.onSaleMap.set(itemToken.id.toString(), mapItem);
    return mapItem;
  }

  @modelAction
  setSuperFeaturedMap(itemToken: APIItemToken) {
    const mapItem = new ItemToken(itemToken);
    this.superFeaturedMap.set(itemToken.id.toString(), mapItem);
    return mapItem;
  }

  @modelAction
  setTopFeaturedMap(itemToken: APIItemToken) {
    const mapItem = new ItemToken(itemToken);
    this.topFeaturedMap.set(itemToken.id.toString(), mapItem);
    return mapItem;
  }

  @modelAction
  setTopSellerMap(itemToken: APIItemToken) {
    const mapItem = new ItemToken(itemToken);
    this.topSellerMap.set(itemToken.id.toString(), mapItem);
    return mapItem;
  }

  @modelAction
  setUserItemTokenMap(itemToken: APIItemToken) {
    const mapItem = new ItemToken(itemToken);
    this.userItemTokenMap.set(itemToken.id.toString(), mapItem);
    return mapItem;
  }

  /* TODO: refactor?
   *
   * is there a better approach for this?
   */
  @modelAction
  setItemTokenMap(itemToken: APIItemToken) {
    this.setOnSaleMap(itemToken);
    this.setTopFeaturedMap(itemToken);
    this.setTopSellerMap(itemToken);
    this.setUserItemTokenMap(itemToken);
    this.setSuperFeaturedMap(itemToken);

    const mapItem = new ItemToken(itemToken);
    return mapItem;
  }

  @modelAction
  removeItemTokenMap(itemToken: APIItemToken) {
    const oldTokenId = itemToken.id.toString();
    this.onSaleMap.delete(oldTokenId);
    this.topFeaturedMap.delete(oldTokenId);
    this.topSellerMap.delete(oldTokenId);
    this.userItemTokenMap.delete(oldTokenId);
    this.superFeaturedMap.delete(oldTokenId);

    const mapItem = new ItemToken(itemToken);
    return mapItem;
  }

  @modelFlow
  fetchOnSaleList = _async(function* (
    this: TokenStore,
    queryIds?: string,
    apiToken?: string,
    sortingParameter?: string
  ) {
    const {
      response: { entities },
    } = yield* _await(
      api.tokens.fetchOnSaleTokenList(
        apiToken,
        queryIds,
        sortingParameter
      ) as Promise<APIResponse>
    );
    const {
      count,
      next,
      previous,
      results: resultsRaw,
    } = entities as APIItemTokenList;
    this.onSaleNextPage = next;
    this.onSaleMap.clear();
    const results = resultsRaw.map((itemToken) => this.setOnSaleMap(itemToken));

    return { count, next: !!next, previous: !!previous, results };
  });

  @modelFlow
  fetchTokenDetail = _async(function* (
    this: TokenStore,
    tokenId: number,
    apiToken?: string
  ) {
    const {
      response: { entities },
    } = yield* _await(
      api.tokens.fetchTokenDetail(tokenId, apiToken) as Promise<APIResponse>
    );
    return this.setOnSaleMap(entities as APIItemTokenDetail);
  });

  @modelFlow
  fetchSuperFeaturedList = _async(function* (this: TokenStore) {
    const {
      response: { entities },
    } = yield* _await(
      api.tokens.fetchSuperFeaturedTokenList() as Promise<APIResponse>
    );

    const {
      count,
      next,
      previous,
      results: resultsRaw,
    } = entities as APIItemTokenList;

    this.superFeaturedMap.clear();
    const results = resultsRaw.map((itemToken) =>
      this.setSuperFeaturedMap(itemToken)
    );

    return { count, next: !!next, previous: !!previous, results };
  });

  @modelFlow
  fetchTopFeaturedList = _async(function* (this: TokenStore) {
    const {
      response: { entities },
    } = yield* _await(
      api.tokens.fetchTopFeaturedTokenList() as Promise<APIResponse>
    );

    const {
      count,
      next,
      previous,
      results: resultsRaw,
    } = entities as APIItemTokenList;

    this.topFeaturedMap.clear();
    const results = resultsRaw.map((itemToken) =>
      this.setTopFeaturedMap(itemToken)
    );

    return { count, next: !!next, previous: !!previous, results };
  });

  @modelFlow
  fetchTopSellerList = _async(function* (this: TokenStore) {
    const {
      response: { entities },
    } = yield* _await(
      api.tokens.fetchTopSellerTokenList() as Promise<APIResponse>
    );

    const {
      count,
      next,
      previous,
      results: resultsRaw,
    } = entities as APIItemTokenList;

    this.topSellerMap.clear();
    const results = resultsRaw.map((itemToken) =>
      this.setTopSellerMap(itemToken)
    );

    return { count, next: !!next, previous: !!previous, results };
  });

  // User Lists

  @modelFlow
  fetchUserOwnedList = _async(function* (this: TokenStore, id: number) {
    const {
      response: { entities },
    } = yield* _await(
      api.tokens.fetchUserOwnedTokenList(id) as Promise<APIResponse>
    );

    const {
      count,
      next,
      previous,
      results: resultsRaw,
    } = entities as APIItemTokenList;
    this.userNextPage = next;
    this.userItemTokenMap.clear();
    const results = resultsRaw.map((itemToken) =>
      this.setUserItemTokenMap(itemToken)
    );

    return { count, next: !!next, previous: !!previous, results };
  });

  @modelFlow
  fetchUserOnSaleList = _async(function* (this: TokenStore, id: number) {
    const {
      response: { entities },
    } = yield* _await(
      api.tokens.fetchUserOnSaleTokenList(id) as Promise<APIResponse>
    );

    const {
      count,
      next,
      previous,
      results: resultsRaw,
    } = entities as APIItemTokenList;
    this.userNextPage = next;
    this.userItemTokenMap.clear();
    const results = resultsRaw.map((itemToken) =>
      this.setUserItemTokenMap(itemToken)
    );

    return { count, next: !!next, previous: !!previous, results };
  });

  @modelFlow
  fetchUserCreatedList = _async(function* (this: TokenStore, id: number) {
    const {
      response: { entities },
    } = yield* _await(
      api.tokens.fetchUserCreatedTokenList(id) as Promise<APIResponse>
    );

    const {
      count,
      next,
      previous,
      results: resultsRaw,
    } = entities as APIItemTokenList;
    this.userNextPage = next;
    this.userItemTokenMap.clear();
    const results = resultsRaw.map((itemToken) =>
      this.setUserItemTokenMap(itemToken)
    );

    return { count, next: !!next, previous: !!previous, results };
  });

  @modelFlow
  fetchUserLikedList = _async(function* (this: TokenStore, id: number) {
    const {
      response: { entities },
    } = yield* _await(
      api.tokens.fetchUserLikedTokenList(id) as Promise<APIResponse>
    );

    const {
      count,
      next,
      previous,
      results: resultsRaw,
    } = entities as APIItemTokenList;
    this.userNextPage = next;
    this.userItemTokenMap.clear();
    const results = resultsRaw.map((itemToken) =>
      this.setUserItemTokenMap(itemToken)
    );

    return { count, next: !!next, previous: !!previous, results };
  });

  @modelFlow
  fetchUserNextPage = _async(function* (this: TokenStore) {
    const {
      response: { entities },
    } = yield* _await(
      api.tokens.fetchUserNextPage(
        this.userNextPage as string
      ) as Promise<APIResponse>
    );
    const {
      count,
      next,
      previous,
      results: resultsRaw,
    } = entities as APIItemTokenList;
    this.userNextPage = next;
    const results = resultsRaw.map((itemToken) =>
      this.setUserItemTokenMap(itemToken)
    );
    return { count, next: !!next, previous: !!previous, results };
  });

  @modelFlow
  fetchOnSaleNextPage = _async(function* (this: TokenStore) {
    const {
      response: { entities },
    } = yield* _await(
      api.tokens.fetchOnSaleNextPage(
        this.onSaleNextPage as string
      ) as Promise<APIResponse>
    );
    const {
      count,
      next,
      previous,
      results: resultsRaw,
    } = entities as APIItemTokenList;
    this.onSaleNextPage = next;
    const results = resultsRaw.map((itemToken) => this.setOnSaleMap(itemToken));
    return { count, next: !!next, previous: !!previous, results };
  });

  @modelFlow
  update = _async(function* (
    this: TokenStore,
    apiToken: string,
    tokenId: number,
    data: APIItemTokenUpdateInput
  ) {
    try {
      const { response } = yield* _await(
        api.tokens.update(tokenId, apiToken, data) as Promise<APIResponse>
      );
      return this.setItemTokenMap(response.entities as APIItemTokenDetail);
    } catch (e) {
      console.debug("[DEBUG]", e);
      throw e;
    }
  });

  @modelFlow
  purchase = _async(function* (
    this: TokenStore,
    itemTokenId: number,
    apiToken: string,
    data: APIPurchaseInput
  ) {
    try {
      const { response } = yield* _await(
        api.tokens.purchase(itemTokenId, apiToken, data) as Promise<APIResponse>
      );
      return response.entities as APIPurchaseResult;
    } catch (e) {
      console.debug("[DEBUG]", e);
      throw e;
    }
  });

  @modelFlow
  placeBid = _async(function* (
    this: TokenStore,
    itemTokenId: number,
    apiToken: string,
    data: APIPlaceBidInput
  ) {
    try {
      const { response } = yield* _await(
        api.tokens.placeBid(itemTokenId, apiToken, data) as Promise<APIResponse>
      );
      const result = response.entities as APIItemToken;
      return this.setItemTokenMap(result);
    } catch (e) {
      console.debug("[DEBUG]", e);
      throw e;
    }
  });

  @modelFlow
  finalizeAuction = _async(function* (
    this: TokenStore,
    itemTokenId: number,
    apiToken: string
  ) {
    try {
      const { response } = yield* _await(
        api.tokens.finalizeAuction(
          itemTokenId,
          apiToken
        ) as Promise<APIResponse>
      );
      const result = response.entities as APIItemToken;
      return this.setItemTokenMap(result);
    } catch (e) {
      console.debug("[DEBUG]", e);
      throw e;
    }
  });
}
