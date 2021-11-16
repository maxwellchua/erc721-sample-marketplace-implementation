import { useStore } from "@monofu/shared/lib/stores";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { Button } from "react-bootstrap";

import styles from "./styles.module.scss";

interface Props {
  isAuction: boolean;
  isPreview: boolean;
  onSale: boolean;
  auctionEnded: boolean;
  ownerId: number;
  onShowModal: () => void;
  onFinalizeAuction: () => void;
}

const TokenCardButton: React.FC<Props> = ({
  isPreview,
  isAuction,
  onSale,
  auctionEnded,
  ownerId,
  onShowModal,
  onFinalizeAuction,
}) => {
  const store = useStore();
  const {
    users: { currentId },
  } = store;

  const handleShowModal = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      onShowModal();
    },
    [onShowModal]
  );

  const handleFinalizeAuction = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      onFinalizeAuction();
    },
    [onFinalizeAuction]
  );

  if (!isPreview && onSale) {
    if (currentId === ownerId) {
      if (isAuction && auctionEnded) {
        return (
          <Button
            className={styles.collectibleContentButton}
            onClick={handleFinalizeAuction}
            variant="outline-secondary"
          >
            Finalize auction
          </Button>
        );
      }
    } else if (!isAuction) {
      return (
        <Button
          className={styles.collectibleContentButton}
          onClick={handleShowModal}
          variant="outline-secondary"
        >
          Buy now
        </Button>
      );
    } else if (!auctionEnded) {
      return (
        <Button
          className={styles.collectibleContentButton}
          onClick={handleShowModal}
          variant="outline-secondary"
        >
          Place bid
        </Button>
      );
    }
  }

  return (
    <Button
      className={styles.collectibleContentButton}
      variant="outline-secondary"
    >
      View item
    </Button>
  );
};

export default observer(TokenCardButton);
