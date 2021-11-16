import { observer } from "mobx-react-lite";
import React from "react";
import { Col, Row } from "react-bootstrap";

import Container from "components/Container";
import Page from "components/Page";
import styles from "./styles.module.scss";

interface Query {
  id: string;
}

// TODO: Need design for a general collectible details page
const CollectiblesDetail: React.FC = observer(() => {
  return (
    <Page>
      <Container>
        <Row className={styles.header}>
          <Col className={styles.headerCol}>Img</Col>
          <Col className={styles.headerCol}>Details</Col>
        </Row>
      </Container>
    </Page>
  );
});

export default CollectiblesDetail;
