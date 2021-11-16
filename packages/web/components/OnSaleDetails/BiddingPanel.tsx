import ItemToken from "@monofu/shared/lib/stores/models/ItemToken";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import CountDown from "components/CountDown";
import classNames from "classnames";
import Bidding from "./Bidding";
import styles from "./styles.module.scss";

interface Props {
  endDate: string;
  isDetailPage?: boolean;
  startDate: string;
  token: ItemToken;
}

const BiddingPanel: React.FC<Props> = ({
  endDate,
  isDetailPage = false,
  token,
  startDate,
}) => {
  const currentDate = new Date();
  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  const [biddingEnded, setBiddingEnded] = useState(eDate < currentDate);
  const [biddingStarted, setBiddingStarted] = useState(sDate <= currentDate);

  return (
    <div>
      <div
        className={classNames(styles.verticalMargin, styles.countDownContainer)}
      >
        {!biddingStarted && (
          <>
            <p className={styles.auctionEndsIn}>Auction starts in</p>
            <CountDown setBiddingEnded={setBiddingStarted} date={sDate} />
          </>
        )}
        {biddingStarted && !biddingEnded ? (
          <>
            <p className={styles.auctionEndsIn}>Auction ends in</p>
            <CountDown setBiddingEnded={setBiddingEnded} date={eDate} />
          </>
        ) : (
          biddingStarted && (
            <p className={styles.auctionEndsIn}>Auction Ended</p>
          )
        )}
      </div>
      <div className={styles.verticalMargin}>
        <Bidding
          item={token}
          isDetailPage={isDetailPage}
          ended={biddingEnded}
          started={biddingStarted}
        />
      </div>
    </div>
  );
};

export default observer(BiddingPanel);
