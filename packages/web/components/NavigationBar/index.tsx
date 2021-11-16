import { useContractKit } from "@celo-tools/use-contractkit";
import { useStore } from "@monofu/shared/lib/stores";
import classNames from "classnames";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button, Nav, Navbar, OverlayTrigger, Popover } from "react-bootstrap";
import { CashCoin, Wallet2 } from "react-bootstrap-icons";

import Avatar from "components/Avatar";

import BurgerIcon from "public/static/images/icons/burger-icon.svg";
import IconLogOut from "public/static/images/icons/log-out.svg";
import IconUser from "public/static/images/icons/user.svg";
import NavXIcon from "public/static/images/icons/nav-x.svg";
import { APP_NAME } from "utils/constants";
import contractKitUtils from "utils/contractkit";
import { ROUTES } from "utils/routes";

import AddFundsModal from "components/AddFundsModal";
import styles from "./styles.module.scss";

interface Props {
  className?: string;
  contentClassName?: string;
}

const NavigationBar: React.FC<Props> = observer(
  ({ className, contentClassName }) => {
    const router = useRouter();
    const { destroy, kit } = useContractKit();
    const store = useStore();
    const [show, setShow] = useState<boolean>(false);
    const [avatarShow, setAvatarShow] = useState<boolean>(false);
    const [showAddFunds, setShowAddFunds] = useState<boolean>(false);
    const { pathname } = router;
    const {
      users: { current: currentUser },
    } = store;

    useEffect(() => {
      (async () => {
        if (currentUser && currentUser.address) {
          await contractKitUtils.account.updateBalance(
            kit,
            store,
            currentUser.address
          );
        }
      })();
    }, [currentUser, currentUser?.address, kit, store]);

    const handleLogout = useCallback(async () => {
      if (currentUser) {
        try {
          await destroy();
          await store.users.logout(currentUser.token);
          await store.reset();

          router.push(ROUTES.root);
        } catch (e) {
          console.debug(e);
        }
      }
    }, [currentUser, router, store, destroy]);

    const handleShowAddFundsModal = useCallback(() => setShowAddFunds(true), [
      setShowAddFunds,
    ]);

    const userPopup = useMemo(
      () =>
        currentUser ? (
          <Popover className={styles.userPopup} id="user-popup">
            <h2 className={styles.userPopupName}>{currentUser.displayName}</h2>
            <div className={styles.userPopupBalance}>
              <div className={styles.userPopupBalanceContent}>
                <div className={styles.userPopupBalanceContentTitle}>
                  Balance
                </div>
                <div className={styles.userPopupBalanceContentValue}>
                  {currentUser.cUSDBalance} cUSD
                </div>
              </div>
            </div>

            <div className={styles.userPopupActionContainer}>
              {currentUser.address ? (
                <Button
                  className={classNames(styles.userPopupAction, "c-py-1")}
                  type="button"
                  variant="link"
                  onClick={handleShowAddFundsModal}
                >
                  <CashCoin className="c-mr-2xs" height={20} width={20} /> Add
                  Funds
                </Button>
              ) : (
                <Link href={ROUTES.connect} passHref>
                  <Button
                    className={classNames(styles.userPopupAction, "c-py-1")}
                    type="button"
                    variant="link"
                  >
                    <Wallet2 className="c-mr-2xs" height={20} width={20} />{" "}
                    Connect Wallet
                  </Button>
                </Link>
              )}
              <Link href={`${ROUTES.usersDetail(currentUser.id)}`} passHref>
                <Button
                  className={styles.userPopupAction}
                  type="button"
                  variant="link"
                >
                  <IconUser className="c-mr-2xs" height={20} width={20} /> My
                  Planet
                </Button>
              </Link>
            </div>
            <div className={styles.userPopupActionContainer}>
              <Button
                className={styles.userPopupAction}
                onClick={handleLogout}
                type="button"
                variant="link"
              >
                <IconLogOut className="c-mr-2xs" height={20} width={20} /> Log
                Out
              </Button>
            </div>
          </Popover>
        ) : null,
      [currentUser, currentUser?.cUSDBalance, handleLogout] // eslint-disable-line react-hooks/exhaustive-deps
    );

    return (
      <>
        <header className={classNames(styles.navigationBar, className)}>
          <Navbar
            expand="lg"
            className={classNames("c-px-0 c-py-4 h-100", contentClassName)}
            variant="dark"
          >
            <Link href={ROUTES.root} passHref>
              <Navbar.Brand
                className={classNames("c-py-0", styles.navigationBrand)}
              >
                <div className={styles.navigationBarLogo}>
                  <img
                    className={styles.navigationBarLogoImg}
                    alt={APP_NAME}
                    src="/static/images/logo.svg"
                  />
                </div>
              </Navbar.Brand>
            </Link>

            <div className={styles.navigationBarDivider} />
            <div className="d-flex d-lg-none">
              {currentUser && (
                <div
                  className="position-relative"
                  onClick={() => {
                    setAvatarShow((prev) => !prev);
                  }}
                >
                  <OverlayTrigger
                    overlay={userPopup!}
                    placement="bottom"
                    rootClose
                    trigger="click"
                    show={avatarShow}
                    onToggle={() => setAvatarShow(false)}
                    onExit={() => setAvatarShow(false)}
                  >
                    <Button
                      className={styles.navigationAvatarBtn}
                      size="sm"
                      variant="outline"
                    >
                      <Avatar
                        displayName={currentUser.displayName}
                        size={32}
                        src={currentUser.profileImage}
                      />
                    </Button>
                  </OverlayTrigger>
                </div>
              )}
              <Navbar.Toggle aria-controls="responsive-navbar-nav">
                <BurgerIcon />
                <NavXIcon />
              </Navbar.Toggle>
            </div>
            <Navbar.Collapse
              id="responsive-navbar-nav"
              className={styles.navigationbarCollapse}
            >
              <Nav
                activeKey={pathname}
                className="c-font-size-xs text-nowrap flex-grow-1 mr-auto w-100"
              >
                <Link href={ROUTES.collectiblesList} passHref>
                  <Nav.Link className={styles.navigationBarLink}>
                    Explore
                  </Nav.Link>
                </Link>
                <Link href={ROUTES.staticHowItWorks} passHref>
                  <Nav.Link className={styles.navigationBarLink}>
                    How it works
                  </Nav.Link>
                </Link>
                {store.users.current ? (
                  <Link
                    href={ROUTES.usersCollectibles(store.users.currentId || 0)}
                    passHref
                  >
                    <Nav.Link className={styles.navigationBarLink}>
                      My items
                    </Nav.Link>
                  </Link>
                ) : (
                  <></>
                )}
                <Link href={ROUTES.staticOurMission} passHref>
                  <Nav.Link className={styles.navigationBarLink}>
                    Our Mission
                  </Nav.Link>
                </Link>
              </Nav>

              <div className={styles.navigationRight}>
                {currentUser && currentUser.isSuperuser && (
                  <div className="mr-3">
                    <Link href={ROUTES.collectiblesCreate} passHref>
                      <Button className={styles.navigationBarCreate} size="sm">
                        Create
                      </Button>
                    </Link>
                  </div>
                )}

                {currentUser ? (
                  <div
                    className="d-none d-lg-block position-relative"
                    onClick={() => {
                      setShow((prev) => !prev);
                    }}
                  >
                    <OverlayTrigger
                      overlay={userPopup!}
                      placement="bottom"
                      rootClose
                      trigger="click"
                      show={show}
                      onToggle={() => setShow(false)}
                      onExit={() => setShow(false)}
                    >
                      <Button
                        className={classNames(
                          styles.navigationBarConnectWallet,
                          styles.loggedIn
                        )}
                        size="sm"
                        variant="outline"
                      >
                        <Avatar
                          displayName={currentUser.displayName}
                          size={32}
                          src={currentUser.profileImage}
                        />

                        <div className="c-ml-xs">
                          {currentUser.cUSDBalance}{" "}
                          <span className={styles.currency}>cUSD</span>
                        </div>
                      </Button>
                    </OverlayTrigger>
                  </div>
                ) : (
                  <Link href={ROUTES.login} passHref>
                    <Button
                      className={styles.navigationBarConnectWallet}
                      size="sm"
                      variant="outline"
                    >
                      Log In
                    </Button>
                  </Link>
                )}
              </div>
            </Navbar.Collapse>
          </Navbar>
        </header>
        <AddFundsModal show={showAddFunds} onShow={setShowAddFunds} />
      </>
    );
  }
);

export default NavigationBar;
