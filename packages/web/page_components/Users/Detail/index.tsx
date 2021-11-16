import { useStore } from "@monofu/shared/lib/stores";
import { User } from "@monofu/shared/lib/stores/models";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { Nav, Tab, Button } from "react-bootstrap";

import Avatar from "components/Avatar";
import Container from "components/Container";
import Page from "components/Page";
import TokenCard from "components/TokenCard";
import IconInstagram from "public/static/images/icons/instagram.svg";
import IconMessenger from "public/static/images/icons/messenger.svg";
import IconTwitter from "public/static/images/icons/twitter.svg";
import { ROUTES } from "utils/routes";
import UploadCoverButton from "public/static/images/icons/upload-cover-button.svg";
import classNames from "classnames";
import AddFundsModal from "components/AddFundsModal";
import styles from "./styles.module.scss";

interface Query {
  id?: string;
}

enum TabKeys {
  Collectibles = "collectibles",
  OnSale = "on-sale",
  Created = "created",
  Liked = "liked",
}

const DEFAULT_COVERS = [
  "/static/images/users/cover1.jpg",
  "/static/images/users/cover2.jpg",
  "/static/images/users/cover3.jpg",
];

const UsersDetail: React.FC = observer(() => {
  const router = useRouter();
  const store = useStore();
  const { id: paramUserId } = (router.query as unknown) as Query;
  const coverImageUploaderRef: React.RefObject<HTMLInputElement> = createRef();
  const [showAddFund, setShowAddFund] = useState<boolean>(false);
  const [tabKey, setTabKey] = useState<TabKeys>(TabKeys.Collectibles);
  const [user, setUser] = useState<User>(new User({ id: 0 }));
  const [coverImage, setCoverImage] = useState<string>("");
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(true);
  const itemTokens = Array.from(store.tokens.userItemTokenMap.values());
  const {
    users: { current: currentUser },
  } = store;

  useEffect(() => {
    if (paramUserId) {
      (async () => {
        const userId = parseInt(paramUserId, 10);
        const userData = await store.users.getUser(userId);
        if (userData) {
          const { coverImage: coverImageData } = userData;
          const defaultCoverImage =
            DEFAULT_COVERS[userId % DEFAULT_COVERS.length];
          setUser(userData);
          setCoverImage(coverImageData || defaultCoverImage);
        } else {
          setUser(
            new User({
              id: 0,
              displayName:
                "Sorry! The user you are looking for cannot be found.",
            })
          );
        }
      })();
    }
  }, [paramUserId, store.users, setCoverImage, setUser]);

  useEffect(() => {
    if (paramUserId) {
      (async () => {
        const userId = parseInt(paramUserId, 10);
        switch (tabKey) {
          case TabKeys.Collectibles: {
            const { next } = await store.tokens.fetchUserOwnedList(userId);
            setShowLoadMoreButton(next);
            break;
          }
          case TabKeys.OnSale: {
            const { next } = await store.tokens.fetchUserOnSaleList(userId);
            setShowLoadMoreButton(next);
            break;
          }
          case TabKeys.Created: {
            const { next } = await store.tokens.fetchUserCreatedList(userId);
            setShowLoadMoreButton(next);
            break;
          }
          case TabKeys.Liked: {
            const { next } = await store.tokens.fetchUserLikedList(userId);
            setShowLoadMoreButton(next);
            break;
          }
          default:
            break;
        }
      })();
    }
  }, [paramUserId, tabKey, store.tokens]);

  useEffect(() => {
    if (window.location.hash) {
      const nextTabKey = window.location.hash.substring(1) as TabKeys;
      setTabKey(
        Object.values(TabKeys).includes(nextTabKey)
          ? nextTabKey
          : TabKeys.Collectibles
      );
    }
  }, [setTabKey]);

  const handleCoverChange = useCallback(async () => {
    if (currentUser && currentUser.id === user.id) {
      const { current } = coverImageUploaderRef;
      if (current && current.files && current.files.length > 0) {
        const file = current.files[0];
        const data = new FormData();
        data.append("cover_image", file);
        const userData = await store.users.updateCoverImage(
          currentUser.token,
          data
        );

        const { coverImage: newCoverImage } = userData;
        if (newCoverImage) {
          setCoverImage(newCoverImage);
        }
      }
    }
  }, [currentUser, coverImageUploaderRef, store.users, user.id, setCoverImage]);

  const handleTabSelect = useCallback(
    (nextTabKey: string | null) => {
      if (paramUserId) {
        setTabKey(nextTabKey as TabKeys);
        router.replace(`${ROUTES.usersDetail(paramUserId)}#${nextTabKey}`);
      }
    },
    [paramUserId, router, setTabKey]
  );

  const handleChangeCoverClick = useCallback(() => {
    const { current } = coverImageUploaderRef;
    if (current) {
      current.click();
    }
  }, [coverImageUploaderRef]);

  const handleShowAddFundModal = useCallback(() => setShowAddFund(true), [
    setShowAddFund,
  ]);

  const handleEditProfileClick = useCallback(() => {
    router.push(ROUTES.userEditProfile);
  }, [router]);

  const handleLoadMoreClick = async () => {
    const { next } = await store.tokens.fetchUserNextPage();
    setShowLoadMoreButton(next);
  };

  return (
    <>
      <Page title={user.displayName} showContentBackground>
        <div className={styles.backgroundImageContainer}>
          {currentUser && currentUser.id === user.id && (
            <>
              <input
                ref={coverImageUploaderRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleCoverChange}
              />
              <Button
                variant="outline-light"
                className={classNames(styles.changeCoverButton, "d-flex")}
                onClick={handleChangeCoverClick}
              >
                <UploadCoverButton />
              </Button>
            </>
          )}
          <img
            className={styles.backgroundImageContainerImg}
            alt="Profile background"
            src={coverImage}
          />
        </div>

        <Container>
          <header className={styles.profileHeader}>
            <Avatar
              className={styles.profileAvatar}
              size={200}
              src={user.profileImage}
            />
            <div className={styles.profileHeaderContent}>
              <div
                className={classNames(
                  styles.profileInfoSocialMedia,
                  "d-lg-none"
                )}
              >
                {user.twitter && (
                  <div className={styles.iconContainer}>
                    <a href={user.twitter} target="_blank" rel="noreferrer">
                      <IconTwitter
                        className={styles.profileInfoSocialMediaIcon}
                      />
                    </a>
                  </div>
                )}
                {user.instagram && (
                  <div className={styles.iconContainer}>
                    <a href={user.instagram} target="_blank" rel="noreferrer">
                      <IconInstagram
                        className={styles.profileInfoSocialMediaIcon}
                      />
                    </a>
                  </div>
                )}
                {user.messenger && (
                  <div className={styles.iconContainer}>
                    <a href={user.messenger} target="_blank" rel="noreferrer">
                      <IconMessenger
                        className={styles.profileInfoSocialMediaIcon}
                      />
                    </a>
                  </div>
                )}
              </div>
              <h1 className="c-font-size-4xl c-mb-2xs font-weight-bold">
                {user.displayName}
              </h1>

              <div className="c-font-size-m">
                <span className="c-color-secondary-dark">
                  {currentUser && currentUser.id === user.id && "My "}
                  Celo Address:
                </span>{" "}
                <span
                  className={classNames(
                    styles.profileHeaderInfoValue,
                    "font-weight-bold"
                  )}
                >
                  {user.address}
                </span>
              </div>

              {currentUser && currentUser.id === user.id && (
                <div className="c-font-size-m ">
                  <span className="c-color-secondary-dark">Balance:</span>{" "}
                  {!!currentUser.cUSDBalance && (
                    <>
                      <span
                        className={classNames(
                          styles.profileHeaderInfoValue,
                          "font-weight-bold"
                        )}
                      >
                        {currentUser.cUSDBalance}
                      </span>{" "}
                      <span className="c-color-secondary font-weight-bold">
                        cUSD
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {paramUserId &&
              store.users.current?.id === parseInt(paramUserId, 10) && (
                <div
                  className={classNames(
                    styles.rightButtonContainer,
                    "d-none d-lg-block"
                  )}
                >
                  <Button
                    variant="outline-light"
                    size="sm"
                    className={classNames(styles.addFundsButton, "c-mr-3")}
                    onClick={handleShowAddFundModal}
                  >
                    Add Funds
                  </Button>
                  <Button
                    variant="outline-light"
                    size="sm"
                    className={styles.editProfileButton}
                    onClick={handleEditProfileClick}
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
          </header>

          <div className={styles.profileInfo}>
            <div
              className={classNames(
                styles.profileInfoSocialMedia,
                "d-none d-lg-flex"
              )}
            >
              {user.twitter && (
                <div className={styles.iconContainer}>
                  <a href={user.twitter} target="_blank" rel="noreferrer">
                    <IconTwitter
                      className={styles.profileInfoSocialMediaIcon}
                    />
                  </a>
                </div>
              )}
              {user.instagram && (
                <div className={styles.iconContainer}>
                  <a href={user.instagram} target="_blank" rel="noreferrer">
                    <IconInstagram
                      className={styles.profileInfoSocialMediaIcon}
                    />
                  </a>
                </div>
              )}
              {user.messenger && (
                <div className={styles.iconContainer}>
                  <a href={user.messenger} target="_blank" rel="noreferrer">
                    <IconMessenger
                      className={styles.profileInfoSocialMediaIcon}
                    />
                  </a>
                </div>
              )}
            </div>

            <div className={styles.profileInfoDescriptionContainer}>
              <p
                className={classNames(styles.profileInfoDescription, "c-mb-0")}
              >
                {user.description}
              </p>
            </div>
          </div>
          {paramUserId &&
            store.users.current?.id === parseInt(paramUserId, 10) && (
              <div
                className={classNames(
                  styles.profileInfoButtonsContainer,
                  "d-block d-lg-none"
                )}
              >
                <Button
                  variant="outline-light"
                  size="sm"
                  className={classNames(styles.addFundsButton, "c-mr-3")}
                  onClick={handleShowAddFundModal}
                >
                  Add Funds
                </Button>
                <Button
                  variant="outline-light"
                  size="sm"
                  className={styles.editProfileButton}
                  onClick={handleEditProfileClick}
                >
                  Edit Profile
                </Button>
              </div>
            )}
          <Tab.Container activeKey={tabKey} onSelect={handleTabSelect}>
            <Nav className="c-mb-l" fill>
              <Nav.Item>
                <Nav.Link
                  className={styles.tabLink}
                  eventKey={TabKeys.Collectibles}
                >
                  Owned by me
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className={styles.tabLink} eventKey={TabKeys.OnSale}>
                  On sale
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className={styles.tabLink} eventKey={TabKeys.Created}>
                  Created by me
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className={styles.tabLink} eventKey={TabKeys.Liked}>
                  Liked
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Tab.Container>
          <div className={classNames(styles.collectibles, "c-mb-3")}>
            {itemTokens.map((itemToken) => {
              const {
                auction,
                collectible: {
                  contractAddress,
                  coverImg,
                  id: collectibleId,
                  title,
                  tokenAmt,
                },
                id,
                onSale,
                ownerName,
                owner,
                price,
                sellType,
                supply,
                tokenNumber,
                mintId,
              } = itemToken;
              return (
                <TokenCard
                  key={id}
                  auction={auction}
                  id={id}
                  onSale={onSale}
                  ownerName={ownerName}
                  ownerId={owner}
                  price={price}
                  sellType={sellType}
                  supply={supply}
                  contractAddress={contractAddress}
                  coverImg={coverImg}
                  collectibleId={collectibleId}
                  title={title}
                  tokenAmt={tokenAmt}
                  tokenNumber={tokenNumber}
                  mintId={mintId}
                />
              );
            })}
          </div>
          {showLoadMoreButton && (
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={handleLoadMoreClick}
            >
              Load more
            </Button>
          )}
        </Container>
      </Page>
      <AddFundsModal show={showAddFund} onShow={setShowAddFund} />
    </>
  );
});

export default UsersDetail;
