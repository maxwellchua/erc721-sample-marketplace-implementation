import Container from "components/Container";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import { SubscriptionModal } from "./SubscriptionModal";

const SubscriptionPanel = () => {
  const [showModal, setShowModal] = useState(false);
  const onSubscribeClick = () => {
    setShowModal(true);
  };
  return (
    <Container className="c-pt-xs">
      <div className={styles.panel}>
        <div className={styles.content}>
          <div className={styles.neverMiss}>Never miss a drop</div>
          <div className={styles.subscribeForExclusive}>
            Subscribe for exclusive drops &amp; collectibles
          </div>
          <br />
          <div
            className={styles.subscribeButton}
            onClick={() => onSubscribeClick()}
          >
            <span className={styles.subscribeText}>Subscribe</span>
          </div>
        </div>
      </div>
      <SubscriptionModal show={showModal} onShow={setShowModal} />
    </Container>
  );
};
export default SubscriptionPanel;
