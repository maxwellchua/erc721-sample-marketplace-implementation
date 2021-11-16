import classNames from "classnames";
import Head from "next/head";
import React from "react";

import Footer from "components/Footer";
import NavigationBar from "components/NavigationBar";
import { APP_NAME } from "utils/constants";

import { replaceIMG } from "utif";
import styles from "./styles.module.scss";

interface Props {
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  showContentBackground?: boolean;
  title?: string;
}

const Page: React.FC<Props> = ({
  children,
  className,
  contentClassName,
  showContentBackground,
  title,
}) => (
  <div className={classNames(styles.page, className)}>
    <Head>
      <title>{title ? `${title} | ${APP_NAME}` : APP_NAME}</title>
    </Head>

    <NavigationBar className={styles.pageNavigationBar} />

    <main
      onLoad={() => replaceIMG()}
      className={classNames(
        styles.pageContent,
        {
          [styles.pageContentBg]: showContentBackground,
        },
        contentClassName
      )}
    >
      {children}
    </main>

    <Footer className={styles.pageFooter} />
  </div>
);

export default Page;
