import { useStore } from "@monofu/shared/lib/stores";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import "react-multi-carousel/lib/styles.css";
import Panel from "../Panel";

const FeaturedList: React.FC = observer(() => {
  const store = useStore();
  const tokens = Array.from(store.tokens.topFeaturedMap.values());

  useEffect(() => {
    (async () => {
      await store.tokens.fetchTopFeaturedList();
    })();
  }, [store]);

  return <Panel items={tokens} title="Featured" />;
});

export default FeaturedList;
