import classNames from "classnames";
import Link from "next/link";
import React from "react";
import { useStore } from "@monofu/shared/lib/stores";
import { Col, Container, Row } from "react-bootstrap";

import IconFacebook from "public/static/images/icons/facebook.svg";
import IconInstagram from "public/static/images/icons/instagram.svg";
// NOTE: Hide linkedin and messenger for now.
// import IconLinkedIn from "public/static/images/icons/linkedin.svg";
// import IconMessenger from "public/static/images/icons/messenger.svg";
import IconTwitter from "public/static/images/icons/twitter.svg";
import { ROUTES } from "utils/routes";

import styles from "./styles.module.scss";

interface Props {
  className?: string;
}

const Footer: React.FC<Props> = ({ className }) => {
  const store = useStore();
  const {
    users: { current: currentUser },
  } = store;

  return (
    <Container
      as="footer"
      className={classNames(styles.footer, className)}
      fluid
    >
      <Row as="nav" xs={1} sm={3} className="c-mx-0">
        <Col className={styles.col}>
          <h2 className={styles.title}>Quick Links</h2>

          <div className={styles.linkContainer}>
            <Link href={ROUTES.collectiblesList}>
              <a className={styles.link}>Explore</a>
            </Link>
          </div>

          {currentUser && currentUser.isSuperuser && (
            <div className={styles.linkContainer}>
              <Link href={ROUTES.collectiblesCreate}>
                <a className={styles.link}>Create</a>
              </Link>
            </div>
          )}

          <div className={styles.linkContainer}>
            <Link href={ROUTES.staticHowItWorks}>
              <a className={styles.link}>How it works</a>
            </Link>
          </div>

          <div className={styles.linkContainer}>
            <Link href={ROUTES.staticOurMission}>
              <a className={styles.link}>Our Mission</a>
            </Link>
          </div>
        </Col>

        <Col className={styles.col}>
          <h2 className={styles.title}>Legal</h2>

          <div className={styles.linkContainer}>
            <Link href={ROUTES.staticPrivacy}>
              <a className={styles.link}>Privacy policy</a>
            </Link>
          </div>

          <div className={styles.linkContainer}>
            <Link href={ROUTES.staticTerms}>
              <a className={styles.link}>Terms and conditions</a>
            </Link>
          </div>

          <div className={styles.linkContainer}>
            <Link href={ROUTES.staticFaqs}>
              <a className={styles.link}>FAQs</a>
            </Link>
          </div>
        </Col>

        <Col className={styles.col}>
          <h2 className={styles.title}>Social Media</h2>

          <div className={styles.socialMediaList}>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              className={styles.socialMediaListItem}
            >
              <IconFacebook />
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer"
              className={styles.socialMediaListItem}
            >
              <IconTwitter />
            </a>

            {/* <a
              href=""
              target="_blank"
              rel="noreferrer"
              className={styles.socialMediaListItem}
            >
              <IconLinkedIn />
            </a> */}
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className={styles.socialMediaListItem}
            >
              <IconInstagram />
            </a>
            {/* <a
              href=""
              target="_blank"
              rel="noreferrer"
              className={styles.socialMediaListItem}
            >
              <IconMessenger />
            </a> */}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Footer;
