import React, { LegacyRef, MouseEventHandler, useRef, useState } from "react";
import ReactPlayer from "react-player";
import ForwardIcon from "public/static/images/icons/15s-forward.svg";
import BackwardIcon from "public/static/images/icons/15s-backward.svg";

import PlayIcon from "public/static/images/icons/play.svg";
import PauseIcon from "public/static/images/icons/pause.svg";
import Fifteen from "public/static/images/icons/15s.svg";
import ProgressPoint from "public/static/images/icons/progress-point.svg";
import styles from "./styles.module.scss";

interface Props {
  file: string;
  title: string;
}

const FocusedAudioPlayer: React.FC<Props> = ({ file, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [minutes, setMinutes] = useState("0");
  const [seconds, setSeconds] = useState("00");
  const progressBarRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<ReactPlayer>();
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [durationSeconds, setDurationSeconds] = useState("00");

  const setDuration = () => {
    if (audioPlayerRef.current) {
      const durationInSeconds = audioPlayerRef.current.getDuration();
      setDurationMinutes(
        Math.floor(durationInSeconds / 60).toLocaleString("en-US", {
          minimumIntegerDigits: 1,
          useGrouping: false,
        })
      );
      setDurationSeconds(
        Math.floor(durationInSeconds % 60).toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })
      );
    }
  };

  const audioPlayerForward = () => {
    if (audioPlayerRef && audioPlayerRef.current) {
      audioPlayerRef.current.seekTo(
        audioPlayerRef.current.getCurrentTime() + 15,
        "seconds"
      );
    }
  };
  const audioPlayerBackward = () => {
    if (audioPlayerRef && audioPlayerRef.current) {
      audioPlayerRef.current.seekTo(
        audioPlayerRef.current.getCurrentTime() - 15,
        "seconds"
      );
    }
  };
  const handleProgressBarClick: MouseEventHandler<HTMLDivElement> = (e) => {
    const progressBarBoundingBox = progressBarRef.current?.getBoundingClientRect();
    if (audioPlayerRef.current && progressBarBoundingBox) {
      const fractionTime =
        (e.clientX - progressBarBoundingBox.x) / progressBarBoundingBox.width;
      audioPlayerRef.current.seekTo(fractionTime, "fraction");
    }
  };

  const handlePlayerProgress = ({
    played,
    playedSeconds,
  }: {
    played: number;
    playedSeconds: number;
  }) => {
    setProgress(played);
    setMinutes(
      Math.floor(playedSeconds / 60).toLocaleString("en-US", {
        minimumIntegerDigits: 1,
        useGrouping: false,
      })
    );
    setSeconds(
      Math.floor(playedSeconds % 60).toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    );
  };

  return (
    <div className={styles.waveFormWrapperLarge}>
      <ReactPlayer
        ref={audioPlayerRef as LegacyRef<ReactPlayer>}
        url={file}
        playing={isPlaying}
        onReady={setDuration}
        onEnded={() => setIsPlaying(false)}
        onProgress={handlePlayerProgress}
        progressInterval={100}
      />
      <h2 className={styles.audioTitle}>{title}</h2>
      <div
        ref={progressBarRef as LegacyRef<HTMLDivElement>}
        className={styles.progressBar}
        onClick={handleProgressBarClick}
      >
        <div
          style={{
            width: `max(13px,${progress * 100}%)`,
          }}
          className={styles.doneProgressBar}
        >
          <ProgressPoint />{" "}
        </div>
      </div>
      <div className={styles.timeContainer}>
        <div>{`${minutes}:${seconds}`}</div>
        <div>{`${durationMinutes}:${durationSeconds}`}</div>
      </div>
      <div className={styles.buttonsContainer}>
        <div
          onClick={audioPlayerBackward}
          className={styles.forwardBackwardButtons}
        >
          <BackwardIcon />
          <div className={styles.fifteen}>
            <Fifteen />
          </div>
        </div>
        <div
          className={styles.waveformContainer}
          style={{
            width: "auto",
            margin: "0px 30px",
            height: "70px",
          }}
        >
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            className={styles.control}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon style={{ marginLeft: 6 }} />}
          </button>
        </div>
        <div
          onClick={audioPlayerForward}
          className={styles.forwardBackwardButtons}
        >
          <ForwardIcon />
          <div className={styles.fifteen}>
            <Fifteen />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusedAudioPlayer;
