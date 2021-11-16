import { User } from "@monofu/shared/lib/stores/models";
import classNames from "classnames";
import Avatar from "components/Avatar";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import { ROUTES } from "utils/routes";

import styles from "./styles.module.scss";

interface Props {
  className?: string;
  description?: string;
  label?: string;
  position?: "before" | "after";
  size?: number;
  user?: User;
}

const AvatarWithInfo: React.FC<Props> = ({
  className,
  description,
  label,
  position = "before",
  size = 40,
  user,
}) => {
  const router = useRouter();

  const redirectToDetails = useCallback(() => {
    if (user?.id) {
      router.push(ROUTES.usersDetail(user.id));
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className={classNames(styles.avatarWithInfo, className)}>
      {description && position === "before" && (
        <p className={classNames(styles.description, styles.before)}>
          {description}
        </p>
      )}
      {label && (
        <span className={classNames(styles.label, "label")}>{label}</span>
      )}
      <div className={styles.badge} onClick={redirectToDetails}>
        <Avatar
          className={styles.avatar}
          displayName={user?.firstName}
          size={size}
          src={user?.profileImage || null}
        />
        <span className={styles.displayName}>{user?.firstName}</span>
      </div>
      {description && position === "after" && (
        <p className={classNames(styles.description, styles.after)}>
          {description}
        </p>
      )}
    </div>
  );
};

export default AvatarWithInfo;
