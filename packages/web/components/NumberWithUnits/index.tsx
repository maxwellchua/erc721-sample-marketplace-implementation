import classNames from "classnames";
import React, { useState } from "react";
import { Form } from "react-bootstrap";

import styles from "./styles.module.scss";

interface Props {
  className?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  max?: number;
  min?: number;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  required?: boolean;
  units: string;
  value?: number;
  step?: string;
}

const NumberWithUnits: React.FC<Props> = ({
  className,
  isInvalid,
  onBlur = () => null,
  onFocus = () => null,
  onChange = () => null,
  units,
  ...otherProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus(e);
  };

  return (
    <div className={styles.formInputNumberWithUnitsContainer}>
      <Form.Control
        className={classNames(
          styles.formInputNumber,
          {
            [styles.invalid]: isInvalid,
          },
          className
        )}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onChange={onChange}
        type="number"
        {...otherProps}
      />
      <div
        className={classNames(styles.formInputNumberUnits, {
          [styles.focused]: isFocused,
          [styles.invalid]: isInvalid,
        })}
      >
        {units}
      </div>
    </div>
  );
};

export default NumberWithUnits;
