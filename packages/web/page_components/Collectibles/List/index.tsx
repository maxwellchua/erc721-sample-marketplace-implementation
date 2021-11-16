import { useStore } from "@monofu/shared/lib/stores";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Button, Dropdown, Image } from "react-bootstrap";
import { observer } from "mobx-react-lite";

import Category from "components/Category";
import Container from "components/Container";
import Page from "components/Page";
import TokenCard from "components/TokenCard";

import classNames from "classnames";
import styles from "./styles.module.scss";

interface Query {
  ids?: string;
  sortBy?: string;
}

interface FilterToggleProps {
  children?: React.ReactNode;
  onClick?: () => void;
}

const FilterToggle = React.forwardRef<HTMLButtonElement, FilterToggleProps>(
  ({ children, onClick }, ref) => (
    <button
      className={styles.headerFiltersButton}
      type="button"
      ref={ref}
      onClick={onClick}
    >
      {children}
    </button>
  )
);

const CollectiblesList: React.FC = observer(() => {
  const router = useRouter();
  const store = useStore();
  const { pathname } = router;
  const {
    categories: { map: categoryMap },
    tokens: { onSaleMap: tokenMap },
    users: { current: currentUser },
  } = store;
  const query = (router.query as unknown) as Query;
  const [filterIds, setFilterIds] = useState<number[]>([]);
  const [sortingParameter, setSortingParameter] = useState<string>("");
  const categories = Array.from(categoryMap.values());
  const tokens = Array.from(tokenMap.values());
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(true);

  useEffect(() => {
    (async () => {
      const queryIds = query.ids;
      const { sortBy } = query;
      await store.categories.fetchCategoryList();
      if (currentUser) {
        const { next } = await store.tokens.fetchOnSaleList(
          queryIds,
          currentUser.token,
          sortBy
        );
        setShowLoadMoreButton(next);
      } else {
        const { next } = await store.tokens.fetchOnSaleList(queryIds, sortBy);
        setShowLoadMoreButton(next);
      }
    })();
  }, [query, store, currentUser]);

  useEffect(() => {
    const ids = (query.ids || "")
      .split(",")
      .map((id) => parseInt(id, 10))
      .filter((id) => !Number.isNaN(id));
    setFilterIds(ids);
    if (query.sortBy && query.sortBy !== sortingParameter)
      setSortingParameter(query.sortBy);
  }, [query, sortingParameter]);

  const handleSortingParameterChange = (sortBy: string) => {
    if (sortBy === query.sortBy) return;
    const nextQuery = { ...query, sortBy };
    router.replace({
      pathname,
      query: nextQuery,
    });
  };

  const handleFilterChange = (filterId: number) => {
    const nextFilterIds = filterIds.includes(filterId)
      ? filterIds.filter((id) => id !== filterId)
      : [...filterIds, filterId];

    const nextQuery = { ...query };
    if (nextFilterIds.length > 0) {
      nextQuery.ids = nextFilterIds.join(",");
    } else {
      delete nextQuery.ids;
    }

    router.replace({
      pathname,
      query: nextQuery,
    });
  };

  const handleFilterReset = () => {
    const nextQuery = { ...query };
    delete nextQuery.ids;

    router.replace({
      pathname,
      query: nextQuery,
    });
  };

  const handleLoadMoreClick = async () => {
    const { next } = await store.tokens.fetchOnSaleNextPage();
    setShowLoadMoreButton(next);
  };

  return (
    <Page title="Explore" showContentBackground>
      <Container className="c-pt-xl">
        <header className={styles.header}>
          <div className={styles.headerFilters}>
            <Category
              active={filterIds.length === 0}
              className={styles.headerFiltersItem}
              id={0}
              name="All"
              onClick={handleFilterReset}
            />

            {categories.map(({ id, name }) => (
              <Category
                active={filterIds.includes(id)}
                className={styles.headerFiltersItem}
                id={id}
                key={id}
                name={name}
                onClick={handleFilterChange}
              />
            ))}
          </div>
          <Dropdown>
            <div className={styles.dropdownToggle}>
              <Dropdown.Toggle
                as={FilterToggle}
                id="dropdown-custom-components"
              >
                <Image
                  alt="Filter"
                  height={20}
                  src="/static/images/icons/filter.svg"
                  width={20}
                />
              </Dropdown.Toggle>
            </div>
            <Dropdown.Menu>
              <Dropdown.Item
                active={sortingParameter === "-id"}
                onClick={() => handleSortingParameterChange("-id")}
                eventKey="1"
              >
                Recently added
              </Dropdown.Item>
              <Dropdown.Item
                active={sortingParameter === "currentPrice"}
                onClick={() => handleSortingParameterChange("currentPrice")}
                eventKey="2"
              >
                Cheapest
              </Dropdown.Item>
              <Dropdown.Item
                active={sortingParameter === "-currentPrice"}
                onClick={() => handleSortingParameterChange("-currentPrice")}
                eventKey="3"
              >
                Highest price
              </Dropdown.Item>
              <Dropdown.Item
                active={sortingParameter === "-likes"}
                onClick={() => handleSortingParameterChange("-likes")}
                eventKey="4"
              >
                Most Liked
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </header>

        <div className={classNames(styles.collectibles, "c-mb-3")}>
          {tokens.map((token) => {
            const {
              auction,
              collectible: {
                contractAddress,
                coverImg,
                id: collectibleId,
                title,
                tokenAmt,
              },
              id,
              onSale,
              ownerName,
              owner,
              price,
              sellType,
              supply,
              tokenNumber,
              mintId,
            } = token;
            return (
              <TokenCard
                key={id}
                auction={auction}
                id={id}
                onSale={onSale}
                ownerName={ownerName}
                ownerId={owner}
                price={price}
                sellType={sellType}
                supply={supply}
                contractAddress={contractAddress}
                coverImg={coverImg}
                collectibleId={collectibleId}
                title={title}
                tokenAmt={tokenAmt}
                tokenNumber={tokenNumber}
                mintId={mintId}
              />
            );
          })}
        </div>
        {showLoadMoreButton && (
          <Button
            variant="outline-secondary"
            className="w-100"
            onClick={handleLoadMoreClick}
          >
            Load more
          </Button>
        )}
      </Container>
    </Page>
  );
});

export default CollectiblesList;
