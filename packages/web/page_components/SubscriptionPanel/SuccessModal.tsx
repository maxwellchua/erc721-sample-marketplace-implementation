import { Modal } from "react-bootstrap";
import XIcon from "public/static/images/icons/x.svg";

import styles from "./styles.module.scss";

interface Props {
  show: boolean;
  onShow: (show: boolean) => void;
}

const SuccessModal: React.FC<Props> = ({ show, onShow }) => (
  <Modal
    centered
    show={show}
    contentClassName={styles.modalContent}
    onHide={() => onShow(false)}
  >
    <Modal.Header className="justify-content-center border-bottom-0">
      <Modal.Title className={styles.headerText}>Success</Modal.Title>
      <div onClick={() => onShow(false)} className={styles.closeIconContainer}>
        <XIcon />
      </div>
    </Modal.Header>
    <Modal.Body>
      <p className={styles.mainText}>
        We will notify you about the next exclusive collection!
      </p>
    </Modal.Body>
  </Modal>
);

export default SuccessModal;
