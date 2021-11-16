import { useContractKit } from "@celo-tools/use-contractkit";
import { useStore } from "@monofu/shared/lib/stores";
import { ItemToken, User } from "@monofu/shared/lib/stores/models";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";

import AvatarWithInfo from "components/AvatarWithInfo";
import PlaceBidModal from "components/TokenCard/PlaceBidModal";
import contractKitUtils from "utils/contractkit";
import { ROUTES } from "utils/routes";
import { Button } from "react-bootstrap";

import styles from "./styles.module.scss";

interface Props {
  ended: boolean;
  isDetailPage?: boolean;
  item: ItemToken;
  started: boolean;
}

const Bidding: React.FC<Props> = ({
  ended,
  isDetailPage = false,
  item,
  started,
}) => {
  const router = useRouter();
  const store = useStore();
  const [highestBidder, setHighestBidder] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { kit, performActions } = useContractKit();
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

  const handleFinalizeAuction = async () => {
    if (currentUser) {
      const success = await contractKitUtils.token.finalizeAuction(
        performActions,
        item.mintId
      );
      await contractKitUtils.account.updateBalance(
        kit,
        store,
        currentUser.address
      );
      if (success) {
        try {
          await store.tokens.finalizeAuction(item.id, currentUser.token);
        } catch (error) {
          // TODO: handle error
        }
      }
    }
  };

  useEffect(() => {
    if (item.auction?.highestBidderId) {
      (async () => {
        const user = await store.users.getUser(
          item.auction?.highestBidderId as number
        );
        setHighestBidder(user as User);
      })();
    }
  });

  return (
    <>
      <div className={styles.bidding}>
        {highestBidder ? (
          <div className={styles.creator}>
            <span className={styles.bidder}> Highest bid by </span>
            <span className={styles.avatarWithInfo}>
              <AvatarWithInfo user={highestBidder} size={30} />
            </span>
          </div>
        ) : (
          <span className={styles.bidder}>Bid Price Starts at</span>
        )}
        <div className={styles.costs}>
          <div>
            <span className={styles.moneyAmount}>
              {item.auction?.currentBiddingPrice}
            </span>
            <span className={styles.currency}> {" cUSD"}</span>
          </div>
        </div>
        <div className={styles.buttonsContainer}>
          {ended && !!currentId ? (
            <>
              {isDetailPage && (
                <Button
                  className={styles.placeBidButton}
                  onClick={handleFinalizeAuction}
                >
                  Finalize Auction
                </Button>
              )}
            </>
          ) : (
            <>
              {started && !ended && currentId !== item.owner && (
                <Button
                  className={styles.placeBidButton}
                  onClick={handleShowModal}
                >
                  Place a Bid
                </Button>
              )}
            </>
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
      <PlaceBidModal
        auction={item.auction}
        contractAddress={item.collectible.contractAddress}
        coverImg={item.collectible.coverImg}
        currentTokenId={item.id}
        ownerId={item.owner}
        onShowModal={setShowModal}
        ownerName={item.ownerName}
        showModal={showModal}
        title={item.collectible.title}
        mintId={item.mintId}
      />
    </>
  );
};

export default observer(Bidding);
