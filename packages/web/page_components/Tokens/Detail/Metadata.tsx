import { Col, Row } from "react-bootstrap";
import styles from "./styles.module.scss";

interface Props {
  duration?: number;
  fileType?: string;
  lyrics?: string;
}

const Metadata: React.FC<Props> = ({
  duration = 0,
  fileType = "Unknown",
  //   lyrics = "",
}) => (
  <div className={styles.metadataContainer}>
    <Row className={styles.metadataRow}>
      <Col className={styles.metadataLabel}>Duration</Col>
      <Col className={styles.metadataValue}>
        {Math.floor(duration / 60)}:{duration % 60}
      </Col>
    </Row>
    <Row className={styles.metadataRow}>
      <Col className={styles.metadataLabel}>File Type</Col>
      <Col className={styles.metadataValue}>{fileType}</Col>
    </Row>
    <Row className={styles.metadataRow}>
      <Col className={styles.metadataLabel}>Lyrics</Col>
      <Col className={styles.metadataValue}>View</Col>
    </Row>
  </div>
);

export default Metadata;
