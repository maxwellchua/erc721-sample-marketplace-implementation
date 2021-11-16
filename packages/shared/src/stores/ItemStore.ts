import {
  _async,
  _await,
  Model,
  model,
  modelFlow,
  objectMap,
  prop,
} from "mobx-keystone";

import api from "../api";
import Item from "./models/Item";

@model("monofu/ItemStore")
export default class ItemStore extends Model({
  map: prop(() => objectMap<Item>()),
  topFeaturedMap: prop(() => objectMap<Item>()),
  topSellerMap: prop(() => objectMap<Item>()),
}) {
  @modelFlow
  fetchItemList = _async(function* (
    this: ItemStore,
    reset: boolean,
    queryIds?: string,
    token?: string
  ) {
    if (reset) {
      this.map.clear();
    }

    let entities: { results: Item[] };
    try {
      ({
        response: { entities },
      } = yield api.items.fetchItemList(token, queryIds));
    } catch (error) {
      console.log("[DEBUG] error", error);
      return;
    }

    const { results: items } = entities;
    items.forEach((data) => {
      try {
        const item = new Item(data);
        this.map.set(`${item.id}`, item);
      } catch (error) {
        console.log("[DEBUG] error", error);
      }
    });
  });

  @modelFlow
  fetchTopFeaturedItemList = _async(function* (this: ItemStore) {
    let entities: { results: Item[] };
    try {
      ({
        response: { entities },
      } = yield api.items.fetchTopFeaturedItemList());
    } catch (error) {
      console.log("[DEBUG] error", error);
      return;
    }

    const { results: items } = entities;
    items.forEach((data) => {
      try {
        const item = new Item(data);
        this.topFeaturedMap.set(`${item.id}`, item);
      } catch (error) {
        console.log("[DEBUG] error", error);
      }
    });
  });

  @modelFlow
  fetchTopSellerItemList = _async(function* (this: ItemStore) {
    let entities: { results: Item[] };
    try {
      ({
        response: { entities },
      } = yield api.items.fetchTopSellerItemList());
    } catch (error) {
      console.log("[DEBUG] error", error);
      return;
    }

    const { results: items } = entities;
    items.forEach((data) => {
      try {
        const item = new Item(data);
        this.topSellerMap.set(`${item.id}`, item);
      } catch (error) {
        console.log("[DEBUG] error", error);
      }
    });
  });

  @modelFlow
  fetchItemDetail = _async(function* (
    this: ItemStore,
    id: number,
    token?: string
  ) {
    // if (this.map.get(`${id}`)) {
    //   return this.map.get(`${id}`);
    // }
    let entities: Item;
    try {
      ({
        response: { entities },
      } = yield api.items.fetchItemDetail(id, token));
    } catch (error) {
      console.log("[DEBUG] error", error);
      return undefined;
    }
    const item = new Item(entities);
    this.map.set(`${entities.id}`, item);
    return item;
  });

  @modelFlow
  checkItemLikeStatus = _async(function* (
    this: ItemStore,
    token: string,
    id: number,
    toggle?: boolean
  ) {
    let entities: { liked: boolean };
    try {
      ({
        response: { entities },
      } = yield api.items.checkItemLikeStatus(id, token, toggle));
    } catch (error) {
      console.log("[DEBUG] error", error);
      return false;
    }
    const { liked } = entities;
    return liked;
  });

  @modelFlow
  createItem = _async(function* (
    this: ItemStore,
    token: string,
    data: FormData
  ) {
    let entities: Item;
    try {
      ({
        response: { entities },
      } = yield api.items.createItem(token, data));
    } catch (error) {
      console.log("[DEBUG] error", error);
      return undefined;
    }
    const item = new Item(entities);
    this.map.set(`${entities.id}`, item);
    return item;
  });

  @modelFlow
  updateItem = _async(function* (
    this: ItemStore,
    token: string,
    id: number,
    data: Record<string, string | number>
  ) {
    let entities: Item;
    try {
      ({
        response: { entities },
      } = yield api.items.updateItem(token, id, data));
    } catch (error) {
      console.log("[DEBUG] error", error);
      return undefined;
    }
    if (this.map.has(`${entities.id}`)) {
      const oldInfo = this.map.get(`${entities.id}`);
      const newInfo = Object.assign(oldInfo, entities);
      this.map.set(`${newInfo.id}`, newInfo);
    } else {
      this.map.set(`${entities.id}`, new Item(entities));
    }
    return entities;
  });

  @modelFlow
  deleteItem = _async(function* (this: ItemStore, token: string, id: number) {
    try {
      yield api.items.deleteItem(token, id);
    } catch (error) {
      console.log("[DEBUG] error", error);
      return;
    }
    this.map.delete(`${id}`);
  });

  @modelFlow
  mintItemTokens = _async(function* (
    this: ItemStore,
    token: string,
    id: number,
    data: FormData
  ) {
    let entities: Item;
    try {
      ({
        response: { entities },
      } = yield api.items.mintItemTokens(token, id, data));
    } catch (error) {
      console.log("[DEBUG] error", error);
      return undefined;
    }
    const item = new Item(entities);
    this.map.set(`${entities.id}`, item);
    return item;
  });
}
