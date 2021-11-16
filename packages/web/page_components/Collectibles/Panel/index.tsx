import { ItemToken } from "@monofu/shared/lib/stores/models";
import { observer } from "mobx-react-lite";
import React, { useCallback, useRef } from "react";
import Carousel from "react-multi-carousel";
import TokenCard from "components/TokenCard";

import CarouselArrowLeftIcon from "public/static/images/icons/carousel-arrow-left.svg";
import CarouselArrowRightIcon from "public/static/images/icons/carousel-arrow-right.svg";

import classNames from "classnames";
import styles from "./styles.module.scss";

interface PanelProps {
  items: ItemToken[];
  title: string;
}

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 2160 },
    items: 5,
  },
  largeDesktop: {
    breakpoint: { max: 2159, min: 1500 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 1499, min: 1200 },
    items: 3,
  },
  laptop: {
    breakpoint: { max: 1199, min: 1024 },
    items: 2,
  },
  tablet: {
    breakpoint: { max: 1023, min: 768 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 767, min: 0 },
    items: 1,
  },
};

const Panel: React.FC<PanelProps> = observer(({ title, items }) => {
  const carouselRef = useRef<Carousel>(null);

  const handleCarouselNext = useCallback(() => {
    if (carouselRef && carouselRef.current) {
      carouselRef.current.next(0);
    }
  }, []);

  const handleCarouselPrevious = useCallback(() => {
    if (carouselRef && carouselRef.current) {
      carouselRef.current.previous(0);
    }
  }, []);

  return (
    <div className={classNames("c-py-m", styles.container)}>
      <div>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.arrowsContainer}>
            <div className={styles.arrow} onClick={handleCarouselPrevious}>
              <CarouselArrowLeftIcon />
            </div>
            <div className={styles.arrow} onClick={handleCarouselNext}>
              <CarouselArrowRightIcon />
            </div>
          </div>
        </div>

        <Carousel
          ref={carouselRef}
          infinite
          draggable={false}
          arrows={false}
          showDots={false}
          responsive={responsive}
          containerClass={classNames("c-py-m", styles.carouselContainer)}
          itemClass={styles.carouselItem}
        >
          {items.map((token) => {
            const {
              auction,
              collectible: {
                contractAddress,
                coverImg,
                id: collectibleId,
                title: collectibleTitle,
                tokenAmt,
              },
              id,
              onSale,
              ownerName,
              price,
              owner,
              sellType,
              supply,
              tokenNumber,
              mintId,
            } = token;
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
                title={collectibleTitle}
                tokenAmt={tokenAmt}
                tokenNumber={tokenNumber}
                mintId={mintId}
              />
            );
          })}
        </Carousel>
      </div>
    </div>
  );
});

export default Panel;
