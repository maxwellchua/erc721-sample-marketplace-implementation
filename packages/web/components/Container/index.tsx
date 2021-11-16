import classNames from "classnames";
import React from "react";

import styles from "./styles.module.scss";

interface Props {
  children?: React.ReactNode;
  className?: string;
}

const Container: React.FC<Props> = ({ children, className }) => (
  <div className={classNames(styles.container, className)}>{children}</div>
);

export default Container;
