import { Modal } from "react-bootstrap";
import FacebookIcon from "public/static/images/icons/facebook-outline.svg";
import InstagramIcon from "public/static/images/icons/instagram-outline.svg";
import PinterestIcon from "public/static/images/icons/pinterest-outline.svg";
import TwitterIcon from "public/static/images/icons/twitter-outline.svg";
import styles from "./styles.module.scss";

interface Props {
  collectibleName?: string;
  isShown: boolean;
  onClose: () => void;
  onFacebookClick?: () => void;
  onTwitterClick?: () => void;
  onInstagramClick?: () => void;
  onPinterestClick?: () => void;
}

const SuccessModal: React.FC<Props> = ({
  collectibleName,
  isShown,
  onClose,
  onFacebookClick = () => {},
  onTwitterClick = () => {},
  onInstagramClick = () => {},
  onPinterestClick = () => {},
}) => (
  <Modal
    show={isShown}
    centered
    dialogClassName={styles.successModal}
    onHide={onClose}
  >
    <Modal.Header closeButton />

    <Modal.Body>
      <h1 className={styles.headerText}>Congrats</h1>
      <p className={styles.mainText}>
        Your item{" "}
        <span className={styles.collectibleName}>{collectibleName}</span> has
        been successfully added to the market.
      </p>
    </Modal.Body>

    <Modal.Footer>
      <p className={styles.shareText}>Share this item</p>
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.button}
          onClick={onFacebookClick}
        >
          <FacebookIcon />
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={onTwitterClick}
        >
          <TwitterIcon />
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={onInstagramClick}
        >
          <InstagramIcon />
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={onPinterestClick}
        >
          <PinterestIcon />
        </button>
      </div>
    </Modal.Footer>
  </Modal>
);

export default SuccessModal;
