import {
  Connector,
  PROVIDERS,
  Screens,
  SupportedProviders,
} from "@celo-tools/use-contractkit";
import { useStore } from "@monofu/shared/lib/stores";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import ReactModal from "react-modal";
import { Button } from "react-bootstrap";

import Page from "components/Page";
import StaticPageContainer from "components/StaticPageContainer";
import contractKitUtils from "utils/contractkit";
import { ROUTES } from "utils/routes";
import XIcon from "public/static/images/icons/x.svg";

import { defaultModalStyles } from "../constants";
import styles from "./styles.module.scss";

const CeloWallet: React.FC = () => {
  const store = useStore();
  const {
    users: { current: currentUser },
  } = store;
  const router = useRouter();
  const provider = PROVIDERS[SupportedProviders.CeloWallet];
  const [
    selectedProvider,
    setSelectedProvider,
  ] = useState<SupportedProviders | null>(null);

  useEffect(() => {
    if (store.loading) return;

    if (!currentUser) {
      router.push(ROUTES.login);
    } else if (currentUser.address) {
      router.push(ROUTES.usersDetail(currentUser.id));
    }
  }, [currentUser, currentUser?.address, router, store.loading]);

  const handleClose = useCallback((): void => {
    setSelectedProvider(null);
  }, [setSelectedProvider]);

  const handleConnect = useCallback(
    async (connector: Connector) => {
      setSelectedProvider(null);
      await contractKitUtils.account.login(connector, store);
    },
    [store, setSelectedProvider]
  );

  let modalContent;
  if (selectedProvider) {
    const ProviderElement = Screens[selectedProvider];
    if (!ProviderElement) {
      return null;
    }
    modalContent = <ProviderElement onSubmit={handleConnect} />;
  }

  return (
    <>
      <Page contentClassName="c-py-0" title={provider.name}>
        <StaticPageContainer>
          <h1 className={styles.title}>{provider.name}</h1>

          <div className={styles.content}>
            <div>
              <p>
                Setup your account for {provider.name} from{" "}
                <a
                  href="https://celowallet.app/setup"
                  target="_blank"
                  rel="noreferrer"
                >
                  celowallet.app/setup
                </a>
              </p>
              <h5 className="c-mb-4 font-weight-bold">
                Finished setting up your account?
              </h5>
              <p>
                <span className="font-weight-bold text-secondary">
                  Click here to create your own account
                </span>{" "}
                and connect to {provider.name}
              </p>
              <Button
                disabled={!!currentUser?.address}
                className="c-px-5"
                onClick={() =>
                  setSelectedProvider(SupportedProviders.CeloWallet)
                }
              >
                Connect
              </Button>
            </div>
          </div>
        </StaticPageContainer>
      </Page>
      <ReactModal
        isOpen={!!selectedProvider}
        onRequestClose={handleClose}
        style={defaultModalStyles}
        overlayClassName="tw-fixed tw-bg-gray-100 dark:tw-bg-gray-700 tw-bg-opacity-75 tw-inset-0"
      >
        <div className="use-ck tw-bg-white dark:tw-bg-gray-800 tw-p-2">
          <button
            type="button"
            onClick={handleClose}
            className="tw-absolute tw-top-3 tw-right-2 tw-text-gray-700 dark:tw-text-gray-400 hover:tw-text-gray-800 dark:hover:tw-text-gray-300 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-p-1 tw-rounded"
          >
            <XIcon />
          </button>
          <div className="tw-px-4 tw-py-4">{modalContent}</div>
        </div>
      </ReactModal>
    </>
  );
};

export default observer(CeloWallet);
