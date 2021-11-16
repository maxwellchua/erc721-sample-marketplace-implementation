import { useContractKit } from "@celo-tools/use-contractkit";
import {
  APIItemCollaborator,
  APIItemTokenUpdateInput,
} from "@monofu/shared/lib/api/tokens";
import { useStore } from "@monofu/shared/lib/stores";
import { User, ItemToken } from "@monofu/shared/lib/stores/models";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";

import AvatarWithInfo from "components/AvatarWithInfo";
import CollectibleDetails from "components/CollectibleDetails";
import Container from "components/Container";
import Page from "components/Page";
import { SellType } from "utils/constants";
import contractKitUtils from "utils/contractkit";

import BiddingPanel from "components/OnSaleDetails/BiddingPanel";
import InstantSalePanel from "components/OnSaleDetails/InstantSalePanel";
// import VideoJSPlayer from "components/VideoJSPlayer";
import { VideoJsPlayer } from "video.js";
import { APIUserListSearchParams } from "@monofu/shared/lib/api/users";
import { ModalFormData } from "./constants";
import PlaceOnSaleModal from "./PlaceOnSaleModal";
import styles from "./styles.module.scss";
import SuccessModal from "./SuccessModal";
import FocusedAudioPlayer from "./FocusedAudioPlayer";

interface Query {
  id: string;
}

const fileTypeAudio = ["mp3", "ogg", "wav"];
const fileTypeImage = ["webp", "png", "jpg", "jpeg", "gif", "tif", "tiff"];
const fileTypeVideo = ["mp4", "mov"];

const VideoJSPlayer = dynamic(() => import("components/VideoJSPlayer"), {
  ssr: false,
});
const WaveformNoSSR = dynamic(() => import("./Waveform"), { ssr: false });

const TokenDetail: React.FC = observer(() => {
  const playerRef = React.useRef<VideoJsPlayer | null>(null);
  const [minters, setMinters] = useState<User[]>(() => []);
  const [owner, setOwner] = useState<User>();
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isImageFocused, setIsImageFocused] = useState<boolean>(false);
  const [isPlacingOnSale, setIsPlacingOnSale] = useState<boolean>(false);
  const [isSuccessModalShown, setIsSuccessModalShown] = useState<boolean>(
    false
  );
  const { performActions } = useContractKit();
  const router = useRouter();
  const store = useStore();
  const {
    users: { current: currentUser },
    tokens: { onSaleMap: tokenMap },
  } = store;
  const query = (router.query as unknown) as Query;
  const token =
    query.id && tokenMap.has(`${query.id}`)
      ? tokenMap.get(`${query.id}`)
      : null;

  useEffect(() => {
    if (query.id) {
      (async () => {
        if (currentUser) {
          await store.tokens.fetchTokenDetail(
            Number(query.id),
            currentUser.token
          );
        } else {
          await store.tokens.fetchTokenDetail(Number(query.id));
        }
      })();
    }
  }, [query, store, currentUser]);

  useEffect(() => {
    if (token) {
      (async () => {
        const {
          collectible: { collaborators },
        } = token;

        const userIds = collaborators.map((collaborator: APIItemCollaborator) =>
          collaborator.user.toString()
        );

        const params: APIUserListSearchParams = {
          id__in: [userIds],
        };

        const { results: users } = await store.users.fetchUserList(params);
        setMinters(users);
      })();
    }
  }, [store, token]);

  useEffect(() => {
    if (token) {
      (async () => {
        const { owner: tokenOwner } = token;
        const user = await store.users.getUser(tokenOwner);
        setOwner(user);
      })();
    }
  }, [store, token]);

  useEffect(() => setCurrentUrl(window.location.href), [setCurrentUrl]);

  const showPlaceOnSaleModal = useCallback(() => setIsPlacingOnSale(true), [
    setIsPlacingOnSale,
  ]);

  const hidePlaceOnSaleModal = useCallback(() => setIsPlacingOnSale(false), [
    setIsPlacingOnSale,
  ]);

  const showSuccessModal = useCallback(() => setIsSuccessModalShown(true), [
    setIsSuccessModalShown,
  ]);

  const hideSuccessModal = useCallback(() => setIsSuccessModalShown(false), [
    setIsSuccessModalShown,
  ]);

  const handlePlaceOnSale = useCallback(
    async (modalFormData: ModalFormData) => {
      if (currentUser && token) {
        hidePlaceOnSaleModal();
        const isAuction = modalFormData.sellType === SellType.auction;
        const success = await contractKitUtils.token.putTokenForSale(
          performActions,
          token.mintId,
          isAuction,
          isAuction ? modalFormData.startDate!.toISOString() : "",
          isAuction ? modalFormData.endDate!.toISOString() : "",
          modalFormData.price!
        );
        const data: APIItemTokenUpdateInput = {
          onSale: true,
          sellType: modalFormData.sellType,
          price: modalFormData.price,
          ...(isAuction && {
            auction: {
              startingBiddingPrice: modalFormData.price,
              startDate: modalFormData.startDate,
              endDate: modalFormData.endDate,
            },
          }),
        };
        if (success) {
          try {
            await store.tokens.update(currentUser.token, token.id, data);
            showSuccessModal();
          } catch (e) {
            //
          }
        }
      }
    },
    [
      token,
      currentUser,
      store,
      hidePlaceOnSaleModal,
      showSuccessModal,
      performActions,
    ]
  );

  const toggleImageFocus = useCallback(
    () => setIsImageFocused((prevState) => !prevState),
    [setIsImageFocused]
  );

  const handleVideoJsPlayerReady = useCallback(
    (player: VideoJsPlayer) => {
      if (!token) return;
      const {
        collectible: { is360Video },
      } = token;

      if (is360Video) {
        playerRef.current = player;

        /* eslint-disable no-param-reassign */
        player.mediainfo = player.mediainfo || {};
        player.mediainfo.projection = "360";
        player.vr();
      }
    },
    [token]
  );

  if (!token) {
    return null;
  }

  const {
    auction,
    collectible: {
      contractAddress,
      coverImg,
      description,
      file1,
      id: collectibleId,
      title,
    },
    onSale,
    owner: tokenOwner,
    sellType,
  } = token;

  const fileType = file1?.split("?")[0].split(".").pop() || "";

  return (
    <>
      <Head>
        {/* Essential META Tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={coverImg} />
        <meta property="og:url" content={currentUrl} />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Non-Essential, But Recommended */}
        <meta property="og:site_name" content="" />
        <meta name="twitter:image:alt" content={`Image for ${title}`} />

        {/* Non-Essential, But Required for Analytics */}
        {/* <meta property="fb:app_id" content="your_app_id" /> */}
        {/* <meta name="twitter:site" content="@website-username"/> */}
      </Head>
      <Page title={title}>
        <Container>
          <div className={styles.header}>
            <Row className={classNames(styles.headerRow, "c-mx-auto")}>
              <Col xs={12} lg={7} className={styles.headerLeft}>
                {fileTypeVideo.includes(fileType) ? (
                  <VideoJSPlayer
                    options={{
                      sources: [
                        {
                          src: file1,
                        },
                      ],
                    }}
                    onReady={handleVideoJsPlayerReady}
                  />
                ) : (
                  <div>
                    <img
                      className={styles.collectibleImage}
                      alt={title}
                      src={fileTypeImage.includes(fileType) ? file1 : coverImg}
                      onClick={toggleImageFocus}
                    />
                    {fileTypeAudio.includes(fileType) && (
                      <div className={styles.waveFormWrapper}>
                        <WaveformNoSSR
                          src={file1}
                          setDuration={() => null}
                          soundOn
                        />
                      </div>
                    )}
                  </div>
                )}
              </Col>
              {onSale ? (
                <Col
                  xs={12}
                  lg={5}
                  className={classNames(styles.headerRight, "c-px-0")}
                >
                  <div className={styles.salePanelContainer}>
                    {sellType === SellType.instant && (
                      <InstantSalePanel item={token} isDetailPage />
                    )}
                    {sellType === SellType.auction && auction && (
                      <BiddingPanel
                        startDate={auction.startDate}
                        endDate={auction.endDate}
                        token={token as ItemToken}
                        isDetailPage
                      />
                    )}
                  </div>
                </Col>
              ) : (
                tokenOwner === currentUser?.id && (
                  <Col
                    xs={12}
                    lg={5}
                    className={classNames(styles.headerRight, "c-px-0")}
                  >
                    <div className={styles.placeOnSale}>
                      <p className={styles.info}>
                        Add your token to the marketplace
                      </p>
                      <div>
                        <Button
                          className="w-100"
                          onClick={showPlaceOnSaleModal}
                        >
                          Place on sale
                        </Button>
                      </div>
                    </div>
                  </Col>
                )
              )}
            </Row>
          </div>
          <div className={styles.collectibleDetails}>
            <CollectibleDetails
              id={collectibleId || 0}
              className="c-mx-auto"
              address={contractAddress || ""}
              description={description}
              name={title || ""}
              owner={owner}
              currentUrl={currentUrl}
            />
          </div>
          {!!minters && minters.length > 0 && (
            <>
              {minters.map((minter, i) => (
                <div className={styles.collectibleCreator} key={minter.id}>
                  <AvatarWithInfo
                    className={classNames(
                      styles.collectibleCreatorInfo,
                      "c-mx-auto"
                    )}
                    description={minter.description}
                    label={i === 0 ? "Created by" : undefined}
                    position="after"
                    user={minter}
                  />
                </div>
              ))}
            </>
          )}
        </Container>

        <Modal
          centered
          dialogClassName={styles.imageModal}
          onHide={toggleImageFocus}
          size="xl"
          show={isImageFocused}
        >
          <img
            className={classNames(styles.collectibleImage, styles.focused)}
            alt={title}
            src={fileTypeImage.includes(fileType) ? file1 : coverImg}
          />
          {fileTypeAudio.includes(fileType) && (
            <FocusedAudioPlayer file={file1} title={title} />
          )}
        </Modal>
        <PlaceOnSaleModal
          isShown={isPlacingOnSale}
          onClose={hidePlaceOnSaleModal}
          onSubmit={handlePlaceOnSale}
        />
        <SuccessModal
          collectibleName={title}
          isShown={isSuccessModalShown}
          onClose={hideSuccessModal}
        />
      </Page>
    </>
  );
});

export default TokenDetail;
