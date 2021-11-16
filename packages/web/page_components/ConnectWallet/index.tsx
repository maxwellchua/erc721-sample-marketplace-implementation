import {
  Connector,
  Screens,
  SupportedProviders,
} from "@celo-tools/use-contractkit";
import { useStore } from "@monofu/shared/lib/stores";
import React, { useCallback, useEffect, useState } from "react";
import ReactModal from "react-modal";
import { useRouter } from "next/router";

import Page from "components/Page";
import StaticPageContainer from "components/StaticPageContainer";
import XIcon from "public/static/images/icons/x.svg";
import contractKitUtils from "utils/contractkit";
import { ROUTES } from "utils/routes";

import classNames from "classnames";
import { useEffectOnce } from "react-use";
import { observer } from "mobx-react-lite";
import {
  CustomProvider,
  customProviders,
  defaultModalStyles,
} from "./constants";
import styles from "./styles.module.scss";

const ConnectWallet: React.FC = () => {
  const router = useRouter();
  const store = useStore();
  const {
    users: { current: currentUser },
  } = store;
  const [providers, setProviders] = useState<[string, CustomProvider][]>(
    () => []
  );
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

  useEffectOnce(() => {
    // NOTE: https://github.com/vercel/next.js/discussions/17443#discussioncomment-87097
    const filteredProviders = Object.entries(customProviders).filter(
      ([, provider]) =>
        typeof window !== "undefined" &&
        provider.showInList() &&
        Object.keys(Screens).find((screen) => screen === provider.name)
    );
    setProviders(filteredProviders);
  });

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
      <Page contentClassName="c-py-0" title="Connect wallet">
        <StaticPageContainer>
          <h1 className={styles.title}>Connect a Wallet</h1>

          <div className={styles.content}>
            <div className={styles.section}>
              <p>
                Wallets are tools that create accounts. Manage keys and help
                users send and receive cryptocurrency and NFTs on the Celo
                network. Each wallet has several different methods available for
                depositing Celo funds, either through a cryptocurrency exchange
                or a provider that accepts debit and credit cards.
              </p>
              <p>
                It&apos;s important to be careful when choosing a wallet because
                they manage your secret account keys. You should only use
                reputable wallets that are well maintained by
                organizations/people that you trust.
              </p>
              <p>
                If you do not already have a Celo wallet, there are a few
                recommended ways to create one.
              </p>
            </div>

            {providers.map(([key, provider]) => {
              const providerKey = key as SupportedProviders;
              const iconClassName = providerKey
                .replace(/\s/g, "-")
                .toLowerCase();

              return (
                <div key={key} className={styles.provider}>
                  <div className={styles.providerContent}>
                    <div
                      className={classNames(
                        styles.providerSection,
                        styles.clickable
                      )}
                      onClick={() => {
                        if (providerKey === SupportedProviders.CeloWallet) {
                          router.push(ROUTES.connectCeloWallet);
                        } else if (provider.canConnect()) {
                          setSelectedProvider(providerKey);
                        } else if (
                          providerKey === SupportedProviders.CeloExtensionWallet
                        ) {
                          router.push(ROUTES.connectCeloExtensionWallet);
                        } else if (
                          providerKey === SupportedProviders.MetaMask
                        ) {
                          router.push(ROUTES.connectMetaMask);
                        }
                      }}
                    >
                      <div className={styles.iconContainer}>
                        {typeof provider.icon === "string" ? (
                          <img
                            src={provider.icon}
                            alt={`${provider.name} logo`}
                            className={classNames(
                              styles.providerIcon,
                              iconClassName
                            )}
                          />
                        ) : (
                          <provider.icon
                            className={classNames(
                              styles.providerIcon,
                              iconClassName
                            )}
                          />
                        )}
                      </div>
                      <div className={styles.description}>
                        {provider.customDescription}
                      </div>
                    </div>
                    {!!provider.links && (
                      <div className={styles.providerSection}>
                        <div className={styles.links}>{provider.links}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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

export default observer(ConnectWallet);
