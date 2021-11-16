import { useStore } from "@monofu/shared/lib/stores";
import { User } from "@monofu/shared/lib/stores/models";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";

import AvatarWithInfo from "components/AvatarWithInfo";
import CeloAddress from "components/CeloAddress";
import HeartIcon from "public/static/images/icons/heart.svg";
import HeartFilledIcon from "public/static/images/icons/heart-filled.svg";
import ShareIcon from "public/static/images/icons/share.svg";
import CopyIcon from "public/static/images/icons/copy.svg";

import { Dropdown } from "react-bootstrap";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import { Facebook, Twitter } from "react-bootstrap-icons";
import styles from "./styles.module.scss";

interface Props {
  id: number;
  className?: string;
  address: string;
  description?: string;
  name: string;
  owner?: User;
  currentUrl: string;
}

interface ShareToggleProps {
  children?: React.ReactNode;
  onClick?: () => void;
}

const ShareToggle = React.forwardRef<HTMLButtonElement, ShareToggleProps>(
  ({ children, onClick }, ref) => (
    <button type="button" ref={ref} onClick={onClick} className={styles.button}>
      {children}
    </button>
  )
);

const CollectibleDetails: React.FC<Props> = observer(
  ({ id, className, address, description, name, owner, currentUrl }) => {
    const [isFavorite, setFavorite] = useState<boolean>(false);
    const store = useStore();
    const {
      users: { current: currentUser },
    } = store;

    useEffect(() => {
      (async () => {
        if (currentUser && id) {
          const liked = await store.items.checkItemLikeStatus(
            currentUser.token,
            id,
            false
          );
          setFavorite(liked);
        }
      })();
    }, [id, currentUser, store.items]);

    const toggleIsFavorite = useCallback(
      async (event: React.MouseEvent<HTMLElement>) => {
        if (currentUser && id) {
          event.stopPropagation();
          setFavorite((prevState) => !prevState);
          await store.items.checkItemLikeStatus(currentUser.token, id, true);
        }
      },
      [id, currentUser, store.items]
    );

    const copy = useCallback(() => {
      navigator.clipboard.writeText(window.location.href);
    }, []);

    return (
      <div className={classNames(styles.collectibleDetails, className)}>
        <p className={styles.name}>{name}</p>
        {address && (
          <CeloAddress className={styles.celoAddress} address={address} />
        )}
        <p className={styles.description}>{description}</p>
        <AvatarWithInfo
          className={styles.collectibleOwnerInfo}
          label="Owned by"
          user={owner}
        />
        <div className={styles.buttons}>
          <Dropdown>
            <div className={styles.dropdownToggle}>
              <Dropdown.Toggle as={ShareToggle} id="dropdown-custom-components">
                <ShareIcon />
              </Dropdown.Toggle>
            </div>
            <Dropdown.Menu>
              <Dropdown.Item onClick={copy} eventKey="1">
                <CopyIcon /> Copy Link
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {currentUser && id && (
            <button
              type="button"
              className={styles.button}
              onClick={toggleIsFavorite}
            >
              {isFavorite ? <HeartFilledIcon /> : <HeartIcon />}
            </button>
          )}
          <FacebookShareButton
            url={currentUrl}
            className={styles.button}
            resetButtonStyle={false}
          >
            <Facebook size={26} />
          </FacebookShareButton>
          <TwitterShareButton
            url={currentUrl}
            className={styles.button}
            resetButtonStyle={false}
          >
            <Twitter size={26} />
          </TwitterShareButton>
        </div>
      </div>
    );
  }
);
export default CollectibleDetails;
