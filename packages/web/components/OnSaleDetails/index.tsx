import { useStore } from "@monofu/shared/lib/stores";
import User from "@monofu/shared/lib/stores/models/User";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import AvatarWithInfo from "components/AvatarWithInfo";
import Container from "components/Container";
import { SellType } from "utils/constants";
import { ROUTES } from "utils/routes";
import BiddingPanel from "./BiddingPanel";
import InstantSalePanel from "./InstantSalePanel";
import styles from "./styles.module.scss";

const OnSaleDetails: React.FC = () => {
  const store = useStore();
  const {
    tokens: { superFeaturedMap: tokenMap },
  } = store;
  const [owner, setOwner] = useState<User>();
  const tokens = Array.from(tokenMap.values());
  const token = tokens.length ? tokens[0] : null;
  const startDate = token?.auction?.startDate;
  const endDate = token?.auction?.endDate;

  useEffect(() => {
    (async () => {
      await store.tokens.fetchSuperFeaturedList();
    })();
  }, [store.tokens]);

  useEffect(() => {
    if (token) {
      (async () => {
        const user = await store.users.getUser(token.owner);
        if (user) {
          setOwner(user);
        }
      })();
    }
  }, [store.users, token]);

  if (!token) return <></>;

  return (
    <Container className="c-pt-xl c-pb-m">
      <Row className={classNames("c-mx-0", styles.row)} xs={1} lg={2}>
        <Col className={styles.leftCol}>
          <div className={styles.backgroundImageContainer}>
            <Link href={ROUTES.collectiblesTokenDetail(token.id)}>
              <img
                className={styles.backgroundImage}
                src={token.collectible.coverImg}
                alt="cover"
              />
            </Link>
          </div>
        </Col>
        <Col className={styles.rightCol}>
          <h1 className={styles.title}>
            <Link href={ROUTES.collectiblesTokenDetail(token.id)}>
              {token.collectible.title}
            </Link>
          </h1>
          <div className={styles.creator}>
            <span className={styles.addedBy}>Added by</span>
            <span className={styles.avatarWithInfo}>
              <AvatarWithInfo user={owner} size={30} />
            </span>
          </div>
          {token.sellType === SellType.auction && (
            <BiddingPanel
              startDate={startDate}
              endDate={endDate}
              token={token}
            />
          )}
          {token.sellType === SellType.instant && (
            <InstantSalePanel item={token} />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default observer(OnSaleDetails);
