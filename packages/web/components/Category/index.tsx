import classNames from "classnames";
import Link from "next/link";
import React from "react";

import styles from "./styles.module.scss";

interface Props {
  active?: boolean;
  className?: string;
  disabled?: boolean;
  href?: string;
  id: number;
  name: string;
  onClick?: (id: number) => void;
}

const Category: React.FC<Props> = ({
  active,
  className,
  disabled,
  href,
  name,
  id,
  onClick = () => null,
}) =>
  href ? (
    <Link href={href}>
      <a
        className={classNames(
          styles.category,
          {
            [styles.active]: active,
          },
          className
        )}
      >
        {name}
      </a>
    </Link>
  ) : (
    <button
      className={classNames(
        styles.category,
        {
          [styles.active]: active,
        },
        className
      )}
      disabled={disabled}
      onClick={() => onClick(id)}
      type="button"
    >
      {name}
    </button>
  );

export default Category;
