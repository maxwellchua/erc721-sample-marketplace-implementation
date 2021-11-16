/* eslint-disable jsx-a11y/media-has-caption */
import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import PlayIcon from "public/static/images/icons/play.svg";
import PauseIcon from "public/static/images/icons/pause.svg";
import styles from "./styles.module.scss";

interface Props {
  src?: string;
  setDuration?: (newDuration: number) => void; // Used to pass track duration to parent component
  soundOn: boolean;
}

const WAVEFORM_PARAMS: Partial<Parameters<typeof WaveSurfer.create>[0]> = {
  backend: "WebAudio",
  barWidth: 2,
  barGap: 2,
  cursorColor: "transparent",
  height: 70,
  progressColor: "#C097FF",
  responsive: true,
  waveColor: "#A6A6A6",
};

const Waveform: React.FC<Props> = ({
  src,
  setDuration = () => {},
  soundOn,
}) => {
  const [waveform, setWaveform] = useState<WaveSurfer>();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const waveformRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!waveform) return;
    if (!soundOn && isPlaying) waveform.playPause();
  }, [soundOn, isPlaying, waveform]);

  useEffect(() => {
    if (!waveform && waveformRef.current) {
      setWaveform(
        WaveSurfer.create({
          ...WAVEFORM_PARAMS,
          container: waveformRef.current,
        })
      );
    }
  }, [src, waveform, waveformRef]);

  useEffect(() => {
    if (waveform && trackRef.current) {
      waveform.load(trackRef.current);
    }
  }, [setDuration, src, trackRef, waveform]);

  useEffect(() => {
    if (trackRef?.current?.duration) {
      setDuration(Math.round(trackRef.current.duration));
    }
  }, [setDuration, trackRef?.current?.duration]);

  const togglePlay = useCallback(() => {
    if (waveform) {
      waveform.playPause();
      setIsPlaying(waveform.isPlaying());
    }
  }, [waveform]);

  return (
    <div className={styles.waveformContainer}>
      <button type="button" onClick={togglePlay} className={styles.control}>
        {isPlaying ? <PauseIcon /> : <PlayIcon style={{ marginLeft: 6 }} />}
      </button>
      <div ref={waveformRef} className={styles.waveform} />
      {src && <audio ref={trackRef} src={src} />}
    </div>
  );
};

export default Waveform;
