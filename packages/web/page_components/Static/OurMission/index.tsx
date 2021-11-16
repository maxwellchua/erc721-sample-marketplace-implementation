import classNames from "classnames";
import Page from "components/Page";
import StaticPageContainer from "components/StaticPageContainer";

import styles from "./styles.module.scss";

const OurMission = () => (
  <Page contentClassName="c-py-0" title="Our Mission">
    <StaticPageContainer>
      <h1 className={styles.title}>About Us</h1>

      <div className={styles.content}>
        <div className={styles.section}>
          <h4>Our Mission</h4>
          <p>
            Is a creative studio and suite of technology
            solutions for the digital goods known as non-fungible tokens, or
            NFTs. Focusing specifically on the music industry, we are interested
            in bringing this technology to underrepresented groups of creators
            and collectors.
          </p>
          <p>
            The non-fungible token space is ripe for improvements in user
            experience and inclusivity. Older generations of cultural
            influencers with decades of creative content at their disposal are
            having difficulty navigating a confusing and unproven technology
            landscape.
          </p>
        </div>

        <div className={styles.section}>
          <h4>Our Creators</h4>
          <p>
            Is currently operating with a list of
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

        <div className={styles.section}>
          <h4>The Marketplace</h4>
          <p>
            Our marketplace will allow creators to sell custom digital goods
            including unique collectable visual art, music, interactive
            experiences, and passes which unlock real-world goods and
            experiences.
          </p>
        </div>
        <div className={styles.section}>
          <h4>Why NFTs?</h4>
          <p>
            We believe that NFTs will continue to expand beyond simple digital
            artwork. The music industry is particularly aligned for innovation
            in this space, with a focus on live and virtual events, fan
            communities, and artistic collaboration.
          </p>
        </div>
        <div className={classNames(styles.section, "c-mb-0")}>
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
            Celo is a company with a mission closely aligned with our own. We
            want to bring this culture of art and technology to a new audience
            so everyone can prosper
          </p>
          <p className="c-mb-0">
            <a href="https://celo.org/" target="_blank" rel="noreferrer">
              Learn more about Celo
            </a>
          </p>
        </div>
      </div>
    </StaticPageContainer>
  </Page>
);

export default OurMission;
