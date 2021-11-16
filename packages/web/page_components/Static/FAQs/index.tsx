import classNames from "classnames";
import Page from "components/Page";
import StaticPageContainer from "components/StaticPageContainer";

import styles from "./styles.module.scss";

const FAQs = () => (
  <Page contentClassName="c-py-0" title="FAQs">
    <StaticPageContainer>
      <h1 className={styles.title}>FAQs</h1>

      <div className={styles.content}>
        <div className={styles.question}>
          <h4>What&apos;s an NFT?</h4>
          <p>
            NFT stands for non-fungible token. Non-fungible is an economic term
            that describes things that are not interchangeable for other items
            because they have unique properties. It could be a signed photograph
            print, a sculpture in your house, or a recording of an event.
          </p>
          <p>
            NFTs are unique collectibles that could be artwork, music, or
            anything else digital. An NFT can only have one official owner at a
            time and the record of this ownership is secured on a blockchain.
            Nobody can modify this record of ownership or make a copy of a
            specific NFT.
          </p>
        </div>

        <div className={styles.question}>
          <h4>What is Celo?</h4>
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

        <div id="what-is-a-wallet" className={styles.question}>
          <h4>What is a wallet?</h4>
          <p>
            They can create accounts, manage keys, and help users send and
            receive cryptocurrency and NFTs on the Celo network. It&apos;s
            important to be careful when choosing a wallet because they manage
            your secret account keys. You should only use reputable wallets that
            are well maintained by organizations/people that you trust.
          </p>
        </div>

        <div className={styles.question}>
          <h4>How do I sign up and get a wallet?</h4>
          <p>
            You don’t need an email or phone to sign up for, you just need a Celo wallet. If you do not already have a Celo
            wallet, there are a few recommended ways to create one.
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
            desktop.{" "}
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
        </div>

        <div className={styles.question}>
          <h4>How do I deposit funds into a Celo wallet?</h4>
          <p>
            Each wallet has several different methods available for depositing
            Celo funds, either through a cryptocurrency exchange or a provider
            that accepts debit and credit cards.
          </p>
        </div>

        <div className={styles.question}>
          <h4>How can I become a creator?</h4>
          <p>
            currently operating with a list of
            exclusive approved creators. If you believe in our mission and are
            interested in becoming a creator{" "}
            <a
              href=""
              target="_blank"
              rel="noreferrer"
            >
              contact us
            </a>{" "}
            and we can talk about your goals.
          </p>
        </div>

        <div className={styles.question}>
          <h4>
            What are the fees for creators and buyers?
          </h4>
          <h5>Service Fees</h5>
          <p>
            The standard service fee for selling items on the marketplace is 5%.
          </p>
          <h5>Gas Fees</h5>
          <p>
            Gas fees cover the computing power required to transact on a
            blockchain. Gas fees on the Celo network are drastically lower than
            typical fees on other networks such as Ethereum. A small fee will be
            incurred by actions in the marketplace:
            <ul>
              <li>Minting a new NFT collectable (paid by the creator)</li>
              <li>Placing a bid in an auction (paid by the bidder)</li>
              <li>Finalizing the purchase of an NFT (paid by the buyer)</li>
            </ul>
          </p>
          {/* Comment out for now since we don't have a good link for it. */}
          {/* <p>
              <a href="#" target="_blank">Learn more about gas fees on blockchains.</a>
            </p> */}
        </div>

        <div className={styles.question}>
          <h4>What is minting?</h4>
          <p>Minting is simply a special name for the NFT creation process.</p>
        </div>

        <div className={styles.question}>
          <h4>What is a token?</h4>
          <p>
            Each copy of an NFT is called a token. Creators get to decide the
            scarcity of their collectables. They can make one of a kind unique
            items or they can mint an NFT that has 10, 100, 1000, or any number
            of tokens. Note that each token is still unique — owning token 2 of
            100 is different from owning token 100 of 100.
          </p>
        </div>

        <div className={classNames(styles.question, "c-mb-0")}>
          <h4>How do royalties work?</h4>
          <p>
            A key tenet of the mission is that all
            creators must be paid. When creators choose to set a royalty amount
            on their collectible, they can get paid not just on the initial
            sale, but they can continue to get paid in the future as the NFT is
            sold from person to person.
          </p>
          <p className="c-mb-0">
            In addition, because an NFT is often a collaboration between several
            different artists in several different disciplines, our creation
            system allows you to specify multiple creators and assign
            percentages for the initial sale as well as royalties on future
            sales.
          </p>
        </div>
      </div>
    </StaticPageContainer>
  </Page>
);

export default FAQs;
