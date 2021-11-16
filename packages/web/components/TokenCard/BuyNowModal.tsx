import { useContractKit } from "@celo-tools/use-contractkit";
import {
  APIPurchaseInput,
  APIPurchaseResult,
} from "@monofu/shared/lib/api/tokens";
import { useStore } from "@monofu/shared/lib/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useCallback, useRef, useState } from "react";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import contractKitUtils from "utils/contractkit";

import CopyIcon from "public/static/images/icons/copy.svg";
import XIcon from "public/static/images/icons/x.svg";
import styles from "./styles.module.scss";

type Props = {
  coverImg?: string;
  contractAddress: string;
  currentTokenId: number;
  isDetailPage?: boolean;
  onShowModal: (isShow: boolean) => void;
  ownerName: string;
  price: number;
  showModal: boolean;
  title: string;
  ownerId: number;
  mintId: number;
};

type FormErrors = {
  token: string;
  price: string;
};

const defaultFormError: FormErrors = {
  token: "",
  price: "",
};

const BuyNowModal: React.FC<Props> = ({
  coverImg,
  contractAddress,
  currentTokenId,
  isDetailPage = false,
  onShowModal,
  ownerName,
  price,
  showModal,
  title,
  ownerId,
  mintId,
}) => {
  const { kit, performActions } = useContractKit();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [
    purchaseResult,
    setPurchaseResult,
  ] = useState<APIPurchaseResult | null>(null);
  const [errors, setErrors] = useState<FormErrors>(defaultFormError);
  const addressRef = useRef<HTMLSpanElement>(null);
  const store = useStore();
  const {
    users: { current: currentUser },
  } = store;

  const copyAddress = useCallback(() => {
    const element = addressRef.current;
    const selection = window.getSelection();
    const range = document.createRange();
    if (!element?.textContent || !selection) {
      return;
    }
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    navigator.clipboard.writeText(element.textContent);
  }, [addressRef]);

  const handleHideModal = useCallback(() => {
    if (!submitting) {
      onShowModal(false);
      setTimeout(() => {
        setErrors(defaultFormError);
        setSubmitSuccess(false);
        if (purchaseResult) {
          if (isDetailPage) {
            const { oldToken } = purchaseResult;
            store.tokens.setItemTokenMap(oldToken);
          } else {
            const { oldToken, newToken } = purchaseResult;
            store.tokens.removeItemTokenMap(oldToken);
            if (newToken) {
              store.tokens.setItemTokenMap(newToken);
            }
          }
          setPurchaseResult(null);
        }
      }, 200);
    }
  }, [
    isDetailPage,
    purchaseResult,
    submitting,
    store.tokens,
    setErrors,
    setSubmitSuccess,
    onShowModal,
  ]);

  const validate = useCallback(async () => {
    if (currentUser && ownerId === currentUser.id) {
      setErrors({
        token: "Token is already owned by you",
        price: "",
      });
      return false;
    }
    if (Number(price) > Number(currentUser?.cUSDBalance)) {
      setErrors({
        token: "",
        price: "The token price is greater than your wallet balance",
      });
      return false;
    }
    setErrors(defaultFormError);
    return true;
  }, [currentUser, ownerId, price]);

  const handleBuyNow = useCallback(async () => {
    if (currentUser && currentUser.address) {
      const isValid = await validate();
      if (!isValid) return;
      setSubmitting(true);

      const receipt = await contractKitUtils.token.purchaseToken(
        performActions,
        mintId
      );
      if (receipt.success) {
        await contractKitUtils.account.updateBalance(
          kit,
          store,
          currentUser.address
        );
        const data: APIPurchaseInput = { price };
        try {
          const result = await store.tokens.purchase(
            currentTokenId,
            currentUser.token,
            data
          );
          setPurchaseResult(result);
        } catch (error) {
          const { message: detail } = error as Error;
          if (detail) {
            Object.entries(JSON.parse(detail)!).forEach(([key, message]) => {
              setErrors((prev) => ({
                ...prev,
                [key as string]: (message as string[])[0],
              }));
            });
          }
          return;
        } finally {
          setSubmitting(false);
        }
        setSubmitSuccess(true);
      } else {
        setErrors((prev) => ({
          ...prev,
          token: receipt.message,
        }));
        setSubmitting(false);
      }
    }
  }, [
    currentUser,
    currentTokenId,
    price,
    mintId,
    store,
    kit,
    performActions,
    validate,
  ]);

  return (
    <Modal
      centered
      contentClassName={styles.modalContent}
      dialogClassName={styles.modalDialog}
      onHide={handleHideModal}
      show={showModal}
    >
      <button
        className={styles.modalClose}
        onClick={handleHideModal}
        type="button"
      >
        <XIcon />
      </button>
      <div className={styles.modalLeft}>
        <h3 className={styles.modalLeftTitle}>Item checkout</h3>

        <div className={styles.modalLeftContent}>
          <div
            className={classNames(
              styles.modalLeftContentName,
              "d-block d-lg-none"
            )}
          >
            {title}
          </div>
          <div className={styles.modalLeftContentImage}>
            {coverImg && (
              <img
                className={styles.collectibleContentImageImg}
                src={coverImg}
                alt=""
              />
            )}
          </div>

          <Container fluid className="c-px-0">
            <div
              className={classNames(
                styles.modalLeftContentName,
                "d-none d-lg-block"
              )}
            >
              {title}
            </div>

            <Row className={styles.modalLeftContentField}>
              <Col xs={4}>
                <span className={styles.modalLeftContentLabel}>Contract:</span>
              </Col>
              <Col className={styles.modalLeftContentValueContainer}>
                <span className={styles.modalLeftContentValue} ref={addressRef}>
                  {contractAddress}
                </span>
              </Col>
              {contractAddress && (
                <Col xs={2} className="text-align-center">
                  <Button
                    variant="link"
                    className={classNames(styles.copyButton, "c-p-0")}
                    onClick={copyAddress}
                  >
                    <CopyIcon />
                  </Button>
                </Col>
              )}
            </Row>

            <Row className={styles.modalLeftContentField}>
              <Col xs={4}>
                <span className={styles.modalLeftContentLabel}>Token ID:</span>
              </Col>
              <Col className={styles.modalLeftContentValueContainer}>
                <span className={styles.modalLeftContentValue}>{mintId}</span>
              </Col>
            </Row>

            <Row className={styles.modalLeftContentField}>
              <Col xs={4}>
                <span className={styles.modalLeftContentLabel}>Seller:</span>
              </Col>
              <Col className={styles.modalLeftContentValueContainer}>
                <span className={styles.modalLeftContentValue}>
                  {ownerName}
                </span>
              </Col>
            </Row>

            <Row className={classNames(styles.modalLeftContentField, "c-pb-5")}>
              <Col xs={4}>
                <span className={styles.modalLeftContentLabel}>Price:</span>
              </Col>
              <Col className={styles.modalLeftContentValueContainer}>
                <span className={styles.modalLeftContentValue}>
                  {price} cUSD
                </span>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
      <div
        className={classNames(styles.modalRight, {
          [styles.modalRightSuccess]: submitSuccess,
        })}
      >
        {submitSuccess ? (
          <>
            <h3 className={styles.modalRightTitle}>Success</h3>
            <p className={styles.modelRightContentSucces}>
              Thank you for your purchase.
            </p>
          </>
        ) : (
          <>
            <h3 className={styles.modalRightTitle}>Summary</h3>

            <div className={styles.modalRightContent}>
              <div className={styles.modalRightContentTitle}>Total</div>
              <div className={styles.modalRightContentPrice}>{price} cUSD</div>
              {!!errors.token && (
                <div className={styles.formInvalid}>{errors.token}</div>
              )}
              {!!errors.price && (
                <div className={styles.formInvalid}>{errors.price}</div>
              )}
            </div>
          </>
        )}

        {submitSuccess ? (
          <Button
            variant="outline-dark"
            className={styles.modalRightButton}
            onClick={handleHideModal}
          >
            Close
          </Button>
        ) : (
          <Button
            className={styles.modalRightButton}
            onClick={handleBuyNow}
            disabled={submitting}
          >
            {submitting ? "Please wait..." : "Buy now"}
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default observer(BuyNowModal);
