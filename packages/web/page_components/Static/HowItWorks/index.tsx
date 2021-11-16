import classNames from "classnames";
import Page from "components/Page";
import StaticPageContainer from "components/StaticPageContainer";
import Link from "next/link";
import { ROUTES } from "utils/routes";

import styles from "./styles.module.scss";

const HowItWorks = () => (
  <Page contentClassName="c-py-0" title="How it works">
    <StaticPageContainer>
      <h1 className={styles.title}>How it works</h1>

      <div className={styles.content}>
        <div className={styles.section}>
          <h4>The Celo Platform</h4>
          <p>
            Transacts on Celo, a new type of blockchain
            software. Celo is a proof-of-stake blockchain. In comparison to
            Proof of Work systems like Bitcoin and Ethereum, this eliminates the
            negative environmental impact and means that users can make
            transactions that are cheaper, faster, and whose outcome cannot be
            changed once complete.
          </p>
          <p>
            <a href="https://celo.org/" target="_blank" rel="noreferrer">
              Learn more about Celo
            </a>
          </p>
        </div>

        <div className={styles.section}>
          <h4>Choosing a Wallet For Signing Up and Creating a Profile</h4>
          <p>
            Wallets are tools that create accounts, manage keys, and help users
            send and receive cryptocurrency and NFTs on the Celo network. Each
            wallet has several different methods available for depositing Celo
            funds, either through a cryptocurrency exchange or a provider that
            accepts debit and credit cards.
          </p>

          <p>
            It&apos;s important to be careful when choosing a wallet because
            they manage your secret account keys. You should only use reputable
            wallets that are well maintained by organizations/people that you
            trust.
          </p>

          <p>
            If you do not already have a Celo wallet, there are a few
            recommended ways to create one.
          </p>

          <h5>Valora</h5>
          <p>
            Valora is a mobile wallet focused on making global peer-to-peer
            payments simple and accessible to anyone. It supports the Celo
            Identity Protocol which allows users to verify their phone number
            and send payments to their contacts. You will need to download a
            separate mobile app, but it will work seamlessly with the platform.
          </p>
          <p>
            <a href="https://valoraapp.com" target="_blank" rel="noreferrer">
              valoraapp.com
            </a>
            <br />
            Platforms: iOS, Android
          </p>

          <h5>CeloWallet.app</h5>
          <p>
            CeloWallet is a lightweight, mobile-friendly wallet for both web and
            desktop.
          </p>
          <p>
            <a href="https://celowallet.app" target="_blank" rel="noreferrer">
              celowallet.app
            </a>
            <br />
            Platforms: Web, MacOS, Linux, Windows
          </p>

          <h5>CeloExtensionWallet</h5>
          <p>
            Celo Extension Wallet is a fork of Metamask for the Celo Network.
            It&apos;s a browser extension for Chrome.
          </p>
          <p>
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noreferrer"
            >
              chrome.google.com/webstore
            </a>
            <br />
            Platforms: Chrome Browser
          </p>

          <h5>Wallet Connect</h5>
          <p>
            Strictly speaking, wallet connect is not a wallet; it is an open
            protocol for connecting wallets to applications.
          </p>
          <p>
            <a
              href="https://walletconnect.org"
              target="_blank"
              rel="noreferrer"
            >
              walletconnect.org
            </a>
            <br />
            Platforms: Browser, iOS, Android
          </p>

          <h5>Metamask</h5>
          <p>
            MetaMask is primarily used for interacting with the Ethereum
            blockchain, and does not natively support Celo compatibility
          </p>
          <p>
            <a
              href="https://docs.celo.org/getting-started/wallets/using-metamask-with-celo"
              target="_blank"
              rel="noreferrer"
            >
              Read more about using Metamask with Celo
            </a>
          </p>

          <h5>Ledger</h5>
          <p>
            Ledger&apos;s hardware wallets are multicurrency wallets that are
            actually physical devices used to store private keys for
            cryptocurrencies offline.
          </p>
          <p>
            <a href="https://ledger.com" target="_blank" rel="noreferrer">
              ledger.com
            </a>
          </p>
          <p>
            <Link href={`${ROUTES.staticFaqs}#what-is-a-wallet`} passHref>
              <a>Read more about crypto wallets in our FAQ</a>
            </Link>
          </p>
        </div>

        <div className={styles.section}>
          <h4>Creating an NFT</h4>
          <h5>Creator Approval</h5>
          <p>
            Is currently operating with a list of
            exclusive approved creators. If you believe in our mission and are
            interested in becoming a creator contact us and we can talk about
            your goals.
          </p>
          <h5>Minting Tokens</h5>
          <p>
            The creation of an NFT is a process called &ldquo;minting&rdquo; and
            each copy of an NFT is called a &ldquo;token&rdquo;. If you are an
            approved creator you will have access to the &ldquo;Create a
            Collectable&rdquo; page where you can upload the files for your NFT
            and customize the details for your offering including promo images,
            price, royalties, number of tokens, and collaborators. You can also
            choose between selling items instantly at a fixed price or setting
            up an auction.
          </p>
          <p>
            Note that to successfully mint an item your wallet will need to be
            funded with enough Celo cover the &ldquo;Gas&rdquo; fees, which
            cover the computing power required to create an NFT. Gas fees on the
            Celo network are drastically lower than typical fees on other
            networks such as Ethereum.{" "}
          </p>
          {/* Comment out for now since we don't have a good link for it. */}
          {/* <p>
              <a href="#">Learn more about gas fees on blockchains.</a>
            </p> */}
        </div>

        <div className={styles.section}>
          <h4>Creator Collaboration</h4>
          <p>
            A key tenet of the mission is that all
            creators must be paid. Because an NFT is often a collaboration
            between several different artists in several different disciplines,
            our creation system allows you to specify multiple creators and
            assign percentages for the initial sale as well as royalties on
            future sales.
          </p>
        </div>
        <div className={styles.section}>
          <h4>Buying an NFT</h4>
          <p>
            You will need to have a Celo wallet with enough funds to purchase or
            bid on the item you want. If you are bidding in an auction, your bid
            amount will be deducted from your wallet and held in reserve. If a
            higher bid is placed your funds will be returned immediately.
          </p>
        </div>
        <div className={classNames(styles.section, "c-mb-0")}>
          <h4>More Questions?</h4>
          <p className="c-mb-0">
            Read more about NFTs and the platform in our{" "}
            <Link href={ROUTES.staticFaqs} passHref>
              <a>FAQ</a>
            </Link>
            .
          </p>
        </div>
      </div>
    </StaticPageContainer>
  </Page>
);

export default HowItWorks;
