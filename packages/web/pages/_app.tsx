import {
  Alfajores,
  ContractKitProvider,
  Mainnet,
} from "@celo-tools/use-contractkit";
import "@celo-tools/use-contractkit/lib/styles.css";

import config from "@monofu/shared/lib/config";
import { createRootStore, StoreProvider } from "@monofu/shared/lib/stores";
import { useEffect, useMemo, useRef } from "react";
import type { AppProps } from "next/app";

import { APP_NAME } from "utils/constants";
import storage, { storageKeySnapshot } from "utils/storage";

import "styles/main.scss";

export default function App({ Component, pageProps }: AppProps) {
  const rootStoreRef = useRef(
    createRootStore({
      loadStorage() {
        return storage.getItem(storageKeySnapshot);
      },

      onReset() {
        return storage.clear();
      },

      onSnapshot(snapshot) {
        return storage.setItem(storageKeySnapshot, snapshot);
      },
    })
  );
  const rootStore = rootStoreRef.current;

  useEffect(() => {
    storage.ready(() => {
      rootStore.load();
    });
  }, [rootStore]);

  const network = useMemo(() => {
    if (config.debug) {
      return Alfajores; // Mainnet;
    }
    return Mainnet;
  }, []);

  return (
    <ContractKitProvider
      dapp={{
        icon: "public/favicon.ico",
        name: APP_NAME,
        description: APP_NAME,
        url: `${config.urls.web}`,
      }}
      network={network}
      networks={[network]}
    >
      <StoreProvider value={rootStore}>
        <Component {...pageProps} />
      </StoreProvider>
    </ContractKitProvider>
  );
}
