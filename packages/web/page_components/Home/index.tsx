import React from "react";

import Page from "components/Page";

import FeaturedList from "page_components/Collectibles/FeaturedList";
import MostPopularList from "page_components/Collectibles/MostPopularList";
import SubscriptionPanel from "page_components/SubscriptionPanel";
import OnSaleDetails from "components/OnSaleDetails";

const Home: React.FC = () => (
  <Page showContentBackground>
    <OnSaleDetails />
    <FeaturedList />
    <MostPopularList />
    <SubscriptionPanel />
  </Page>
);

export default Home;
