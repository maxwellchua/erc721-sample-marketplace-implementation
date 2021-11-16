import { onSnapshot, registerRootStore } from "mobx-keystone";
import React from "react";

import CategoryStore from "./CategoryStore";
import ItemStore from "./ItemStore";
import RootStore, { RootStoreConfig } from "./RootStore";
import TokenStore from "./TokenStore";
import UserStore from "./UserStore";

const StoreContext = React.createContext<RootStore>({} as RootStore);

const useStore = () => React.useContext(StoreContext);
const { Provider: StoreProvider } = StoreContext;

function createRootStore(config: RootStoreConfig = {}) {
  const rootStore = new RootStore({
    categories: new CategoryStore({}),
    items: new ItemStore({}),
    tokens: new TokenStore({}),
    users: new UserStore({}),
  });
  rootStore.config = config;

  registerRootStore(rootStore);

  onSnapshot(rootStore, (newSnapshot, prevSnapshot) => {
    if (config.onSnapshot) config.onSnapshot(newSnapshot, prevSnapshot);
  });

  return rootStore;
}

export { RootStore, StoreContext, StoreProvider, createRootStore, useStore };
