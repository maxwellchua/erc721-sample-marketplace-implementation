import { computed } from "mobx";
import {
  _async,
  _await,
  Model,
  model,
  modelAction,
  modelFlow,
  objectMap,
  prop,
  asMap,
} from "mobx-keystone";

import { APIResponse } from "api/base";
import {
  APIUpdateWalletTokenInput,
  APIUser,
  APIUserList,
  APIUserListSearchParams,
  APIUserUpdateInput,
} from "api/users";
import { APILoginInput, APILoginResult } from "api/auth";
import api from "../api";
import User from "./models/User";

@model("monofu/UserStore")
export default class UserStore extends Model({
  currentId: prop<number | null>(null),
  map: prop(() => objectMap<User>()),
  userArrayMap: prop<[string, User][]>(() => []),
}) {
  get userMap() {
    return asMap(this.userArrayMap);
  }

  @computed
  get current() {
    const { currentId } = this;
    return currentId ? this.map.get(currentId.toString()) : undefined;
  }

  @modelFlow
  init = _async(function* (this: UserStore) {
    yield* _await(Promise.all([this.fetchUserList()]));
  });

  @modelAction
  setMap(user: APIUser) {
    const mapItem = new User(user);
    this.map.set(user.id.toString(), mapItem);
    return mapItem;
  }

  @modelAction
  setUserMap(user: APIUser) {
    const mapItem = new User(user);
    this.userMap.set(user.id.toString(), mapItem);
    return mapItem;
  }

  @modelAction
  setBalance(celoBalance: string, cUSDBalance: string) {
    if (this.currentId && this.map.has(`${this.currentId}`)) {
      const oldUserInfo = this.map.get(`${this.currentId}`);
      const newUserInfo = Object.assign(oldUserInfo, {
        celoBalance,
        cUSDBalance,
      });
      this.map.set(`${this.currentId}`, newUserInfo);
    }
  }

  @modelFlow
  login = _async(function* (this: UserStore, data: APILoginInput) {
    try {
      const {
        response: { entities },
      } = yield* _await(api.auth.login(data) as Promise<APIResponse>);

      const { token, user: userData } = entities as APILoginResult;
      _await(api.localStorage.setAuthToken(token));
      const user = new User({ token, ...userData });

      this.map.set(user.id.toString(), user);
      this.currentId = user.id;

      return user;
    } catch (e) {
      console.debug("[DEBUG]", e);
      throw e;
    }
  });

  @modelFlow
  logout = _async(function* (this: UserStore, apiToken: string) {
    try {
      yield* _await(api.auth.logout(apiToken));
      this.currentId = null;
      this.map.clear();
      _await(api.localStorage.removeAuthToken());
    } catch (e) {
      console.debug("[DEBUG]", e);
      throw e;
    }
  });

  @modelFlow
  fetchUserList = _async(function* (
    this: UserStore,
    params?: APIUserListSearchParams
  ) {
    const {
      response: { entities },
    } = yield* _await(api.users.fetchUserList(params) as Promise<APIResponse>);

    const {
      count,
      next,
      previous,
      results: resultsRaw,
    } = entities as APIUserList;

    this.userMap.clear();
    const results = resultsRaw.map((user) => this.setUserMap(user));
    return { count, next: !!next, previous: !!previous, results };
  });

  @modelFlow
  fetchMe = _async(function* (this: UserStore, apiToken: string) {
    try {
      const {
        response: { entities },
      } = yield* _await(
        api.users.fetchMyUserInfo(apiToken) as Promise<APIResponse>
      );

      const currentUser = new User({
        token: apiToken,
        ...entities,
      });
      this.map.set(`${currentUser.id}`, currentUser);
      this.currentId = currentUser.id;

      return currentUser;
    } catch (e) {
      console.debug("[DEBUG] error", e);
      throw e;
    }
  });

  @modelFlow
  getUser = _async(function* (this: UserStore, userId: number) {
    if (this.map.get(`${userId}`)) {
      return this.map.get(`${userId}`);
    }
    let entities: User;
    try {
      ({
        response: { entities },
      } = yield api.users.fetchUserDetail(userId));
    } catch (error) {
      console.log("[DEBUG] error", error);
      return undefined;
    }
    if (this.map.has(`${entities.id}`)) {
      const oldUserInfo = this.map.get(`${entities.id}`);
      const newUserInfo = Object.assign(oldUserInfo, entities);
      this.map.set(`${newUserInfo.id}`, newUserInfo);
    } else {
      this.map.set(`${entities.id}`, entities);
    }
    return entities;
  });

  @modelFlow
  updateUserInfo = _async(function* (
    this: UserStore,
    apiToken: string,
    data: APIUserUpdateInput
  ) {
    try {
      const { response } = yield* _await(
        api.users.editMyUserInfo(apiToken, data) as Promise<APIResponse>
      );

      const user = response.entities as APIUser;
      const oldUserInfo = this.map.get(user.id.toString());
      const newUserInfo = Object.assign(oldUserInfo, user) as User;
      this.map.set(user.id.toString(), newUserInfo);

      return newUserInfo;
    } catch (e) {
      console.debug("[DEBUG}", e);
      throw e;
    }
  });

  @modelFlow
  updateProfileImage = _async(function* (
    this: UserStore,
    apiToken: string,
    data: FormData
  ) {
    try {
      const { response } = yield* _await(
        api.users.editMyAvatar(apiToken, data) as Promise<APIResponse>
      );

      const user = response.entities as APIUser;
      const oldUserInfo = this.map.get(user.id.toString());
      const newUserInfo = Object.assign(oldUserInfo, user) as User;
      this.map.set(user.id.toString(), newUserInfo);

      return newUserInfo;
    } catch (e) {
      console.debug("[DEBUG}", e);
      throw e;
    }
  });

  @modelFlow
  updateCoverImage = _async(function* (
    this: UserStore,
    apiToken: string,
    data: FormData
  ) {
    try {
      const { response } = yield* _await(
        api.users.editCoverImage(apiToken, data) as Promise<APIResponse>
      );

      const user = response.entities as APIUser;
      const oldUserInfo = this.map.get(user.id.toString());
      const newUserInfo = Object.assign(oldUserInfo, user) as User;
      this.map.set(`${newUserInfo.id}`, newUserInfo);

      return newUserInfo;
    } catch (e) {
      console.debug("[DEBUG}", e);
      throw e;
    }
  });

  @modelFlow
  updateWalletToken = _async(function* (
    this: UserStore,
    apiToken: string,
    data: APIUpdateWalletTokenInput
  ) {
    try {
      const { response } = yield* _await(
        api.users.editWalletToken(apiToken, data) as Promise<APIResponse>
      );

      const user = response.entities as APIUser;
      const oldUserInfo = this.map.get(user.id.toString());
      const newUserInfo = Object.assign(oldUserInfo, user) as User;
      this.map.set(`${newUserInfo.id}`, newUserInfo);

      return newUserInfo;
    } catch (e) {
      console.debug("[DEBUG}", e);
      throw e;
    }
  });
}
