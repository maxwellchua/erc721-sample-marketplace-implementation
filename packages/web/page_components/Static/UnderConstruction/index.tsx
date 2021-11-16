import { useStore } from "@monofu/shared/lib/stores";
import React from "react";

import Category from "components/Category";
import Page from "components/Page";
import { ROUTES } from "utils/routes";

import styles from "./styles.module.scss";

const UnderConstruction = () => {
  const store = useStore();
  const {
    categories: { map: categoryMap },
  } = store;
  const categories = Array.from(categoryMap.values());

  return (
    <Page contentClassName="c-py-0" title="Under Construction">
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            This page is under construction,
            <br />
            please check back later
          </h1>

          <div className={styles.subtitle}>
            In the meantime, you might want to explore our categories:
          </div>

          <div className={styles.categories}>
            <Category
              className={styles.categoriesItem}
              href={ROUTES.collectiblesList}
              id={0}
              name="All"
            />

            {categories.map(({ id, name }) => (
              <Category
                className={styles.categoriesItem}
                href={`${ROUTES.collectiblesList}?ids=${id}`}
                id={id}
                key={id}
                name={name}
              />
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default UnderConstruction;
