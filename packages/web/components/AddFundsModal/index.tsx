import { useStore } from "@monofu/shared/lib/stores";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { Modal, Container, Row, Col, Button } from "react-bootstrap";

import styles from "./styles.module.scss";

type Props = {
  show: boolean;
  onShow: (show: boolean) => void;
};

const AddFundsModal: React.FC<Props> = ({ show, onShow }) => {
  const store = useStore();
  const {
    users: { current: currentUser },
  } = store;
  const handleClose = useCallback(() => onShow(false), [onShow]);

  if (!currentUser) {
    return null;
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className={styles.modalHeader} closeButton>
        <Modal.Title>Where to buy Celo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-center">
          Celo currencies can be earned or purchased from online exchange
          including these.
        </p>
        <Container fluid>
          <Row>
            <Col>
              <Button
                variant=""
                className={styles.buttonLink}
                href="https://www.coinbase.com/earn/celo"
                target="_blank"
              >
                <img alt="Coinbase" src="/static/images/icons/coinbase.svg" />
                <span>Coinbase</span>
              </Button>
            </Col>
            <Col>
              <Button
                variant=""
                className={styles.buttonLink}
                href="https://global.bittrex.com/Market/Index?MarketName=USD-CELO"
                target="_blank"
              >
                <img alt="Coinbase" src="/static/images/icons/bittrex.svg" />
                <span>Bittrex</span>
              </Button>
            </Col>
            <Col>
              <Button
                variant=""
                className={styles.buttonLink}
                href="https://www.okcoin.com/spot/trade/celo-usd"
                target="_blank"
              >
                <img alt="Coinbase" src="/static/images/icons/okcoin.svg" />
                <span>Okcoin</span>
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button
                variant=""
                className={styles.buttonLink}
                href="https://www.binance.com/en/trade/CELO_BTC"
                target="_blank"
              >
                <img alt="Coinbase" src="/static/images/icons/binance.svg" />
                <span>Binance</span>
              </Button>
            </Col>
            <Col>
              <Button
                variant=""
                className={styles.buttonLink}
                href={`https://valoraapp.com/simplex?address=${currentUser.address}`}
                target="_blank"
              >
                <img alt="Coinbase" src="/static/images/icons/simplex.svg" />
                <span>Simplex</span>
              </Button>
            </Col>
            <Col>
              <Button
                variant=""
                className={styles.buttonLink}
                href="https://coinlist.co/asset/celo"
                target="_blank"
              >
                <img alt="Coinbase" src="/static/images/icons/coinlist.svg" />
                <span>Coinlist</span>
              </Button>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default observer(AddFundsModal);
