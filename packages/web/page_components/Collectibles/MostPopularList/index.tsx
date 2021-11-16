import { useStore } from "@monofu/shared/lib/stores";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import "react-multi-carousel/lib/styles.css";
import Panel from "../Panel";

const MostPopularList: React.FC = observer(() => {
  const store = useStore();
  const tokens = Array.from(store.tokens.topSellerMap.values());

  useEffect(() => {
    (async () => {
      await store.tokens.fetchTopSellerList();
    })();
  }, [store]);

  return <Panel items={tokens} title="Most Popular" />;
});

export default MostPopularList;
