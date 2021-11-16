import { useStore } from "@monofu/shared/lib/stores";
import { ItemToken } from "@monofu/shared/lib/stores/models";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import classNames from "classnames";
import { Button } from "react-bootstrap";

import BuyNowModal from "components/TokenCard/BuyNowModal";
import { ROUTES } from "utils/routes";

import styles from "./styles.module.scss";

interface Props {
  item: ItemToken;
  isDetailPage?: boolean;
}

const InstantSalePanel: React.FC<Props> = ({ item, isDetailPage = false }) => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const store = useStore();
  const {
    users: { current: currentUser, currentId },
  } = store;

  const handleShowModal = useCallback(
    async (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      if (!currentUser) {
        router.push(ROUTES.login);
      } else if (!currentUser.address) {
        router.push(ROUTES.connect);
      } else {
        setShowModal(true);
      }
    },
    [currentUser, router]
  );

  return (
    <>
      <div className={classNames(styles.instantSale, styles.verticalMargin)}>
        <div className={styles.bidding}>
          <span className={styles.bidder}>Current price</span>
          <div className={styles.costs}>
            <div>
              <span className={styles.moneyAmount}> {item.price} </span>
              <span className={styles.currency}>{" cUSD"}</span>
            </div>
          </div>
          <div className={styles.buttonsContainer}>
            {currentId !== item.owner && (
              <Button
                className={styles.placeBidButton}
                onClick={handleShowModal}
              >
                Buy Now
              </Button>
            )}
            {!isDetailPage && (
              <Link href={ROUTES.collectiblesTokenDetail(item.id)} passHref>
                <Button variant="" className={styles.viewArtworkButton}>
                  View artwork
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      <BuyNowModal
        isDetailPage={isDetailPage}
        coverImg={item.collectible.coverImg}
        contractAddress={item.collectible.contractAddress}
        currentTokenId={item.id}
        onShowModal={setShowModal}
        ownerName={item.ownerName}
        ownerId={item.owner}
        price={item.price}
        showModal={showModal}
        title={item.collectible.title}
        mintId={item.mintId}
      />
    </>
  );
};

export default observer(InstantSalePanel);
