import {
  _async,
  _await,
  // applySnapshot,
  Model,
  model,
  modelFlow,
  prop,
  SnapshotOutOfModel,
} from "mobx-keystone";

import api from "../api";
import CategoryStore from "./CategoryStore";
import ItemStore from "./ItemStore";
import TokenStore from "./TokenStore";
import UserStore from "./UserStore";

export interface RootStoreConfig {
  loadStorage?: () => Promise<SnapshotOutOfModel<RootStore> | null>;
  onReset?: (rootStore: RootStore) => Promise<void>;
  onSnapshot?: (
    snapshot: SnapshotOutOfModel<RootStore>,
    prevSnapshot: SnapshotOutOfModel<RootStore>
  ) => Promise<SnapshotOutOfModel<RootStore> | null>;
}

@model("monofu/RootStore")
export default class RootStore extends Model({
  categories: prop<CategoryStore>(),
  items: prop<ItemStore>(),
  tokens: prop<TokenStore>(),
  users: prop<UserStore>(),
  loading: prop<boolean>(true),
}) {
  config!: RootStoreConfig;

  @modelFlow
  load = _async(function* (this: RootStore) {
    this.loading = true;
    const storedToken = yield* _await(api.localStorage.getAuthToken());
    if (storedToken) {
      try {
        yield* _await(this.users.fetchMe(storedToken));
      } catch (e) {
        console.debug("Failed to fetch user");
      }
    }

    // let snapshot: SnapshotOutOfModel<RootStore> | null = null;
    // if (this.config.loadStorage) {
    //   snapshot = yield * _await(this.config.loadStorage());
    // }
    // if (snapshot) {
    //   applySnapshot(this, {
    //     ...snapshot,
    //     $modelId: this.$modelId,
    //     $modelType: this.$modelType,
    //   });
    // }
    // this.categories.fetchCategoryList();
    // this.items.fetchItemList();
    // this.users.fetchUserList();
    this.loading = false;
  });

  @modelFlow
  reset = _async(function* (this: RootStore) {
    this.loading = true;
    if (this.config.onReset) {
      yield* _await(this.config.onReset(this));
    }

    // this.categories = new CategoryStore({});
    this.items = new ItemStore({});
    this.tokens = new TokenStore({});
    this.users = new UserStore({});
    this.loading = false;
  });
}
