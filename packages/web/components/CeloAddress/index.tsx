import classNames from "classnames";
import CopyIcon from "public/static/images/icons/copy.svg";
import { useCallback, useRef } from "react";
import { Button } from "react-bootstrap";

import styles from "./styles.module.scss";

interface Props {
  className?: string;
  address: string;
}

const CeloAddress: React.FC<Props> = ({ className, address }) => {
  const addressRef = useRef<HTMLSpanElement>(null);

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

  return (
    <div className={classNames(styles.celoAddress, className)}>
      <span className={styles.label}>Contract Address:</span>
      <span className={styles.value} ref={addressRef}>
        {address}
      </span>
      <Button
        variant="link"
        className={classNames(styles.button, "c-p-0")}
        onClick={copyAddress}
      >
        <CopyIcon />
      </Button>
    </div>
  );
};

export default CeloAddress;
