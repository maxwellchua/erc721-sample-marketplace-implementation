import {
  Provider,
  PROVIDERS,
  SupportedProviders,
} from "@celo-tools/use-contractkit";
import React from "react";

export const defaultModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    border: "unset",
    background: "unset",
    padding: "unset",
    borderRadius: 16,
    boxShadow: "0px 3px 4px 0px rgba(0, 0, 0, 0.15)",
  },
};

const {
  Valora,
  CeloWallet,
  CeloExtensionWallet,
  WalletConnect,
  MetaMask,
  Ledger,
  PrivateKey,
  Injected,
  CeloTerminal,
  CeloDance,
} = SupportedProviders;

export interface CustomProvider extends Provider {
  customDescription: JSX.Element;
  links?: JSX.Element;
}

type BaseProviders<U> = {
  [K in SupportedProviders]: U;
};

type CustomProviders = Omit<
  BaseProviders<CustomProvider>,
  typeof PrivateKey | typeof Injected | typeof CeloTerminal | typeof CeloDance
>;

export const customProviders: CustomProviders = {
  [Valora]: {
    ...PROVIDERS[Valora],
    customDescription: (
      <>
        <h4>Valora</h4>
        <p>
          Valora is a mobile wallet focused on making global peer-to-peer
          payments simple and accessible to anyone. It supports the Celo
          Identity Protocol which allows users to verify their phone number and
          send payments to their contacts. You will need to download a separate
          mobile app, but it will work seamlessly with the  platform.
        </p>

        <p>
          <a
            href="https://valoraapp.com"
            target="_blank"
            rel="noreferrer"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
              e.stopPropagation()
            }
          >
            valoraapp.com
          </a>
          <br />
          Platforms: iOS, Android
        </p>
      </>
    ),
  },
  [CeloWallet]: {
    ...PROVIDERS[CeloWallet],
    customDescription: (
      <>
        <h4>CeloWallet.app</h4>
        <p>
          CeloWallet is a lightweight, mobile-friendly wallet for both web and
          desktop.{" "}
        </p>
        <p>
          <a
            href="https://celowallet.app"
            target="_blank"
            rel="noreferrer"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
              e.stopPropagation()
            }
          >
            celowallet.app
          </a>
          <br />
          Platforms: Web, MacOS, Linux, Windows
        </p>
      </>
    ),
  },
  [CeloExtensionWallet]: {
    ...PROVIDERS[CeloExtensionWallet],
    customDescription: (
      <>
        <h4>CeloExtensionWallet</h4>
        <p>
          Celo Extension Wallet is a fork of Metamask for the Celo Network.
          It&apos;s a browser extension for Chrome.
        </p>
        <p>
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noreferrer"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
              e.stopPropagation()
            }
          >
            chrome.google.com/webstore
          </a>
          <br />
          Platforms: Chrome Browser
        </p>
      </>
    ),
  },
  [WalletConnect]: {
    ...PROVIDERS[WalletConnect],
    customDescription: (
      <>
        <h4>Wallet Connect</h4>
        <p>
          Strictly speaking, wallet connect is not a wallet; it is an open
          protocol for connecting wallets to applications.
        </p>
        <p>
          <a
            href="https://walletconnect.org"
            target="_blank"
            rel="noreferrer"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
              e.stopPropagation()
            }
          >
            walletconnect.org
          </a>
          <br />
          Platforms: Browser, iOS, Android
        </p>
      </>
    ),
  },
  [MetaMask]: {
    ...PROVIDERS[MetaMask],
    customDescription: (
      <>
        <h4>Metamask</h4>
        <p>
          MetaMask is primarily used for interacting with the Ethereum
          blockchain, and does not natively support Celo compatibility
        </p>
      </>
    ),
    links: (
      <p>
        <a
          href="https://docs.celo.org/getting-started/wallets/using-metamask-with-celo"
          target="_blank"
          rel="noreferrer"
        >
          Read more about using Metamask with Celo
        </a>
      </p>
    ),
  },
  [Ledger]: {
    ...PROVIDERS[Ledger],
    customDescription: (
      <>
        <h4>Ledger</h4>
        <p>
          Ledger&apos;s hardware wallets are multicurrency wallets that are
          actually physical devices used to store private keys for
          cryptocurrencies offline.
        </p>

        <p>
          <a
            href="https://ledger.com"
            target="_blank"
            rel="noreferrer"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
              e.stopPropagation()
            }
          >
            ledger.com
          </a>
        </p>
      </>
    ),
  },
};
