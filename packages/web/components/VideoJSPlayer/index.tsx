import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import videojs from "video.js";
import "videojs-seek-buttons";
import "videojs-vr";

import "video.js/dist/video-js.css";
import "videojs-seek-buttons/dist/videojs-seek-buttons.css";
import "videojs-vr/dist/videojs-vr.css";

type Props = {
  options?: videojs.PlayerOptions;
  onReady?: (player: videojs.Player) => void;
};

const initialOptions: videojs.PlayerOptions = {
  controlBar: {
    pictureInPictureToggle: false,
  },
  controls: true,
  fluid: true,
  plugins: {
    seekButtons: {
      forward: 15,
      back: 15,
    },
  },
  preload: "auto",
  responsive: true,
};

const VideoJSPlayer: React.FC<Props> = ({ options, onReady }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const playerRef = React.useRef<videojs.Player | null>(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (videoElement) {
        /* eslint-disable no-multi-assign */
        const player = (playerRef.current = videojs(
          videoElement,
          { ...initialOptions, ...options },
          () => {
            if (typeof onReady === "function") onReady(player);
          }
        ));
      }
    }
  }, [options, playerRef, videoRef, onReady]);

  useEffect(
    () => () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    },
    [playerRef]
  );

  return (
    <div data-vjs-player>
      {/* eslint-disable jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        /* Source: https://github.com/videojs/videojs-vr/issues/59#issuecomment-389196883 */
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default observer(VideoJSPlayer);
