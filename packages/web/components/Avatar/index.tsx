import classNames from "classnames";
import React, { useState } from "react";

import styles from "./styles.module.scss";

interface Props {
  className?: string;
  displayName?: string;
  size?: number;
  src: string | null;
  onClick?: (e: React.FormEvent<HTMLImageElement>) => void;
}

const Avatar: React.FC<Props> = ({
  className,
  displayName,
  size = 45,
  src,
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={classNames(styles.avatar, className)}
      style={{ height: `${size}px`, width: `${size}px` }}
      title={displayName}
    >
      <img
        className={styles.avatarImg}
        alt={displayName}
        onError={() => setHasError(true)}
        src={hasError || !src ? "/static/images/icons/user-default.svg" : src}
        onClick={onClick}
      />
    </div>
  );
};

export default Avatar;
