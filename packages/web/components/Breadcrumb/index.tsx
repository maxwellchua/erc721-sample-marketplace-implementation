import React from "react";
import { Breadcrumb as BSBreadcrumb } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";

import styles from "./styles.module.scss";

export type BreadcrumbLink = {
  label: string;
  href: string;
  isActive?: boolean;
};

interface Props {
  items: BreadcrumbLink[];
}

const Breadcrumb: React.FC<Props> = ({ items }) => (
  <BSBreadcrumb bsPrefix={styles.breadcrumb}>
    {items.map((item) => {
      const { label, href, isActive } = item;

      return (
        <BSBreadcrumb.Item
          key={uuidv4()}
          bsPrefix={styles.breadcrumbItem}
          href={href}
          active={isActive}
        >
          {label}
        </BSBreadcrumb.Item>
      );
    })}
  </BSBreadcrumb>
);

export default Breadcrumb;
