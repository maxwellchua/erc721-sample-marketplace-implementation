import { useStore } from "@monofu/shared/lib/stores";
import { Auction } from "@monofu/shared/lib/stores/models";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useEffectOnce } from "react-use";
import React, { useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import { useContractKit } from "@celo-tools/use-contractkit";
import moment from "moment";

import contractKitUtils from "utils/contractkit";
import { ROUTES } from "utils/routes";
import { SellType } from "utils/constants";
import HeartSolidIcon from "public/static/images/icons/heart-solid.svg";
import HeartOutlineIcon from "public/static/images/icons/heart-outline.svg";
import BuyNowModal from "./BuyNowModal";
import PlaceBidModal from "./PlaceBidModal";
import TokenCardButton from "./TokenCardButton";

import styles from "./styles.module.scss";

interface Props {
  className?: string;
  isPreview?: boolean;
  auction: Auction | null;
  id: number;
  onSale: boolean;
  ownerName: string;
  ownerId: number;
  price: number;
  sellType: number;
  supply: number;
  contractAddress: string;
  coverImg?: string;
  collectibleId: number;
  title: string;
  tokenAmt: number;
  tokenNumber: number;
  mintId: number;
}

const TokenCard: React.FC<Props> = ({
  className,
  isPreview = false,
  auction,
  id,
  onSale,
  ownerName,
  ownerId,
  price,
  sellType,
  supply,
  contractAddress,
  coverImg,
  collectibleId,
  title,
  tokenAmt,
  tokenNumber,
  mintId,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isFavorite, setFavorite] = useState(false);

  const router = useRouter();
  const store = useStore();
  const { kit, performActions } = useContractKit();
  const {
    users: { current: currentUser },
    items,
  } = store;
  const isAuction = sellType === SellType.auction;

  const endDate = (auction && moment(auction.endDate)) || null;
  const auctionEnded = !!endDate && moment().isAfter(endDate);

  useEffectOnce(() => {
    (async () => {
      if (currentUser && collectibleId) {
        const liked = await items.checkItemLikeStatus(
          currentUser.token,
          collectibleId,
          false
        );
        setFavorite(liked);
      }
    })();
  });

  const redirectToDetails = useCallback(() => {
    if (!isPreview) {
      router.push(ROUTES.collectiblesTokenDetail(id));
    }
  }, [id, isPreview, router]);

  const handleLikeClick = useCallback(
    async (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      if (!isPreview && currentUser && collectibleId) {
        setFavorite((prevState) => !prevState);
        await items.checkItemLikeStatus(currentUser.token, collectibleId, true);
      }
    },
    [collectibleId, currentUser, isPreview, items]
  );

  const handleShowModal = useCallback(async () => {
    if (!isPreview) {
      if (!currentUser) {
        router.push(ROUTES.login);
      } else if (!currentUser.address) {
        router.push(ROUTES.connect);
      } else {
        setShowModal(true);
      }
    }
  }, [currentUser, isPreview, router, setShowModal]);

  const handleFinalizeAuction = useCallback(async () => {
    if (currentUser) {
      const success = await contractKitUtils.token.finalizeAuction(
        performActions,
        mintId
      );
      await contractKitUtils.account.updateBalance(
        kit,
        store,
        currentUser.address
      );
      if (success) {
        try {
          await store.tokens.finalizeAuction(id, currentUser.token);
        } catch (error) {
          // TODO: handle error
        }
      }
    }
  }, [currentUser, id, kit, performActions, store, mintId]);

  const stackingEffectStyles = supply > 1 ? styles.stackingEffect : null;

  return (
    <>
      <div
        className={classNames(
          styles.collectible,
          className,
          stackingEffectStyles
        )}
        onClick={redirectToDetails}
      >
        <header className={styles.collectibleHeader}>
          <div className={styles.collectibleHeaderText}>
            <span className={styles.collectibleHeaderTextName} title={title}>
              {title}
            </span>
          </div>

          <button
            onClick={handleLikeClick}
            className={styles.collectibleFavorite}
            type="button"
          >
            {isFavorite ? <HeartSolidIcon /> : <HeartOutlineIcon />}
          </button>
        </header>

        <div className={styles.collectibleContent}>
          <div className={styles.collectibleContentPrice}>
            {onSale ? (
              <span>
                {isAuction && auction
                  ? auction.currentBiddingPrice || auction.startingBiddingPrice
                  : price}{" "}
                cUSD
              </span>
            ) : (
              <span className={styles.collectibleNotForSale}>Not for sale</span>
            )}
            <span className={styles.collectibleContentQuantity}>
              {tokenNumber} of {tokenAmt}
            </span>
          </div>

          <div className="flex-grow-1">
            <div className={styles.collectibleContentImage}>
              {coverImg && (
                <img
                  className={styles.collectibleContentImageImg}
                  src={coverImg}
                  alt=""
                />
              )}
            </div>
          </div>

          <TokenCardButton
            isAuction={isAuction}
            isPreview={isPreview}
            onSale={onSale}
            auctionEnded={auctionEnded}
            ownerId={ownerId}
            onShowModal={handleShowModal}
            onFinalizeAuction={handleFinalizeAuction}
          />
        </div>
      </div>
      {!isPreview &&
        onSale &&
        (isAuction ? (
          !auctionEnded && (
            <PlaceBidModal
              auction={auction}
              contractAddress={contractAddress}
              coverImg={coverImg}
              currentTokenId={id}
              ownerId={ownerId}
              onShowModal={setShowModal}
              ownerName={ownerName}
              showModal={showModal}
              title={title}
              mintId={mintId}
            />
          )
        ) : (
          <BuyNowModal
            coverImg={coverImg}
            contractAddress={contractAddress}
            currentTokenId={id}
            onShowModal={setShowModal}
            ownerName={ownerName}
            ownerId={ownerId}
            price={price}
            showModal={showModal}
            title={title}
            mintId={mintId}
          />
        ))}
    </>
  );
};

export default observer(TokenCard);
