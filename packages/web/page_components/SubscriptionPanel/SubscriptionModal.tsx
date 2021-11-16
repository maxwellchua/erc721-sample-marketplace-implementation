import React, { useCallback, useState } from "react";
import { Button, FormControl, Modal } from "react-bootstrap";
import { subscribe } from "@monofu/shared/lib/api/users";
import XIcon from "public/static/images/icons/x.svg";
import classNames from "classnames";
import SuccessModal from "./SuccessModal";

import styles from "./styles.module.scss";

interface SubscriptionModalProps {
  show: boolean;
  onShow: (show: boolean) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  show,
  onShow,
}) => {
  const [email, setEmail] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isShowSuccess, setIsShowSuccess] = useState<boolean>(false);

  const onSubscribeClick = useCallback(() => {
    (async () => {
      setErrorMsg("");
      try {
        await subscribe({ emailAddress: email.toLowerCase() });
        onShow(false);
        setIsShowSuccess(true);
      } catch (err: any) {
        setErrorMsg(err.emailAddress[0]);
      }
    })();
  }, [email, onShow, setIsShowSuccess, setErrorMsg]);

  const handleHide = useCallback(() => {
    onShow(false);
    setErrorMsg("");
    setEmail("");
  }, [onShow, setEmail, setErrorMsg]);

  return (
    <>
      <Modal
        show={show}
        contentClassName={styles.modalContent}
        onHide={handleHide}
      >
        <Modal.Header className="border-bottom-0">
          <Modal.Title className={styles.modalTitle}>
            Never miss a drop
          </Modal.Title>
          <div onClick={handleHide} className={styles.closeIconContainer}>
            <XIcon />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div>
            <p className="c-mb-4">
              Subscribe for exclusive drops &amp; collectibles.
            </p>
          </div>
          <FormControl
            placeholder="your@email.com"
            className={styles.emailInput}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className={styles.errorMsg}> {errorMsg}</p>
          <Button className="w-100 c-mb-2" onClick={onSubscribeClick}>
            Subscribe
          </Button>

          <Button
            variant="outline-light"
            className="w-100"
            onClick={handleHide}
          >
            Cancel
          </Button>
        </Modal.Body>
      </Modal>
      <SuccessModal show={isShowSuccess} onShow={setIsShowSuccess} />
    </>
  );
};
