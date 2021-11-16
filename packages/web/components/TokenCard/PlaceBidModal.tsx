import { useContractKit } from "@celo-tools/use-contractkit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useCallback, useMemo, useRef } from "react";
import { Button, Col, Container, Form, Modal, Row } from "react-bootstrap";
import { Auction } from "@monofu/shared/lib/stores/models";
import { useStore } from "@monofu/shared/lib/stores";
import { APIPlaceBidInput } from "@monofu/shared/lib/api/tokens";
import NumberWithUnits from "components/NumberWithUnits";
import contractKitUtils from "utils/contractkit";

import CopyIcon from "public/static/images/icons/copy.svg";
import XIcon from "public/static/images/icons/x.svg";
import { Controller, useForm } from "react-hook-form";
import moment from "moment";
import styles from "./styles.module.scss";

type Props = {
  auction: Auction | null;
  contractAddress: string;
  coverImg?: string;
  currentTokenId: number;
  onShowModal: (isShow: boolean) => void;
  ownerName: string;
  showModal: boolean;
  title: string;
  ownerId: number;
  mintId: number;
};

const PlaceBidModal: React.FC<Props> = ({
  auction,
  contractAddress,
  coverImg,
  currentTokenId,
  onShowModal,
  ownerName,
  ownerId,
  showModal,
  title,
  mintId,
}) => {
  const { kit, performActions } = useContractKit();
  const {
    control,
    formState: { errors, isValid, isSubmitSuccessful, isSubmitting },
    clearErrors,
    handleSubmit,
    reset,
    setError,
    watch,
  } = useForm();
  const addressRef = useRef<HTMLSpanElement>(null);
  const store = useStore();
  const {
    users: { current: currentUser },
  } = store;
  const watchBidValue = watch("bidValue");

  const defaultBidValue = useMemo(() => {
    if (!auction) return undefined;

    const {
      highestBidderId,
      currentBiddingPrice,
      startingBiddingPrice,
    } = auction;

    if (highestBidderId) {
      return currentBiddingPrice + 1;
    }
    return startingBiddingPrice;
  }, [auction]);

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
    if (!isSubmitting) {
      onShowModal(false);

      setTimeout(() => {
        reset();
      }, 200);
    }
  }, [isSubmitting, reset, onShowModal]);

  const validate = useCallback(
    (data: APIPlaceBidInput) => {
      if (!auction) return false;

      if (!isValid) clearErrors();

      const bidValue = Number(data.bidValue);
      const {
        currentBiddingPrice,
        highestBidderId,
        endDate: auctionEndDate,
        startDate: auctionStartDate,
        startingBiddingPrice,
      } = auction;
      const startDate = moment(auctionStartDate);
      const endDate = moment(auctionEndDate);

      if (moment().isBefore(startDate)) {
        setError("auction", {
          type: "manual",
          message: `bid must be created after ${startDate}`,
        });
        return false;
      }
      if (moment().isAfter(endDate)) {
        setError("auction", {
          type: "manual",
          message: `auction has ended at ${endDate}`,
        });
        return false;
      }

      if (highestBidderId) {
        if (bidValue <= currentBiddingPrice) {
          setError("bidValue", {
            type: "manual",
            message:
              "Your bid is lower than the highest bid." +
              " Please enter a higher amount",
          });
          return false;
        }
      } else if (bidValue < startingBiddingPrice) {
        setError("bidValue", {
          type: "manual",
          message:
            "Your bid is lower or not equal to the starting bid." +
            " Please enter a higher amount",
        });
        return false;
      }

      if (currentUser?.id === ownerId) {
        setError("auction", {
          type: "manual",
          message: "You cannot place bid on your own token",
        });
        return false;
      }
      if (bidValue > Number(currentUser?.cUSDBalance)) {
        setError("bidValue", {
          type: "manual",
          message: "The bid value is greater than your wallet balance",
        });
        return false;
      }
      return true;
    },
    [auction, currentUser, isValid, ownerId, clearErrors, setError]
  );

  const handlePlaceBid = useCallback(
    async (data: APIPlaceBidInput) => {
      if (currentUser && auction) {
        if (!validate(data)) return;

        const receipt = await contractKitUtils.token.placeTokenBid(
          performActions,
          mintId,
          data.bidValue
        );
        if (receipt.success) {
          await contractKitUtils.account.updateBalance(
            kit,
            store,
            currentUser.address
          );
          try {
            await store.tokens.placeBid(
              currentTokenId,
              currentUser.token,
              data
            );
          } catch (error) {
            const { message: detail } = error as Error;
            if (detail) {
              Object.entries(JSON.parse(detail)!).forEach(([key, message]) => {
                setError(key as string, { message: (message as string[])[0] });
              });
            }
          }
        } else {
          setError("auction", {
            message: receipt.message,
          });
        }
      }
    },
    [
      auction,
      currentUser,
      currentTokenId,
      kit,
      store,
      mintId,
      performActions,
      setError,
      validate,
    ]
  );

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
                <span className={styles.modalLeftContentLabel}>
                  Highest bid:
                </span>
              </Col>
              <Col className={styles.modalLeftContentValueContainer}>
                <span className={styles.modalLeftContentValue}>
                  {auction?.currentBiddingPrice ||
                    auction?.startingBiddingPrice}{" "}
                  cUSD
                </span>
              </Col>
            </Row>
            <Row className={styles.modalLeftContentText}>
              <Col>
                <p className="c-mb-0">
                  Your bid amount will be deducted from your wallet and held in
                  reserve. If a higher bid is placed your funds will be returned
                  immediately.
                </p>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
      <div
        className={classNames(styles.modalRight, {
          [styles.modalRightSuccess]: isSubmitSuccessful,
        })}
      >
        {isSubmitSuccessful ? (
          <>
            <h3 className={styles.modalRightTitle}>Success</h3>
            <p className={styles.modelRightContentSucces}>
              Your bid is being processed. You will receive a notification if
              another Collector has a higher offer.
            </p>
            <Button
              variant="outline-dark"
              className={styles.modalRightButton}
              onClick={handleHideModal}
            >
              Close
            </Button>
          </>
        ) : (
          <Form onSubmit={handleSubmit(handlePlaceBid)}>
            <h4 className={styles.modalRightTitle}>Your bid</h4>
            <Form.Group
              controlId="formBidValue"
              className={classNames(styles.modalRightContent, styles.form)}
            >
              <Form.Label>Enter your bid:</Form.Label>
              <Controller
                control={control}
                name="bidValue"
                defaultValue={defaultBidValue}
                render={({ field: { onChange, onBlur, value, name } }) => (
                  <NumberWithUnits
                    disabled={isSubmitting}
                    isInvalid={!!errors.bidValue}
                    min={0}
                    placeholder="0"
                    required
                    units="cUSD"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    name={name}
                  />
                )}
              />

              {!!errors.bidValue && (
                <div className={styles.formInvalid}>
                  {errors.bidValue.message}
                </div>
              )}

              <Controller
                control={control}
                name="auction"
                defaultValue={auction?.id}
                render={({ field }) => <input type="hidden" {...field} />}
              />

              {!!errors.auction && (
                <div className={styles.formInvalid}>
                  {errors.auction.message}
                </div>
              )}
            </Form.Group>

            <Button
              type="submit"
              className={styles.modalRightButton}
              disabled={watchBidValue <= 0 || isSubmitting}
            >
              {isSubmitting ? "Please wait..." : "Place a bid"}
            </Button>
          </Form>
        )}
      </div>
    </Modal>
  );
};

export default observer(PlaceBidModal);
