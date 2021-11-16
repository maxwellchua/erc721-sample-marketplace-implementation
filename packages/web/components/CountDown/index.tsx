import React, { useEffect, useRef } from "react";
import CountDown from "react-countdown";

interface Props {
  date: Date;
  setBiddingEnded: (x: boolean) => void;
}

const textStyle = {
  fontFamily: "Helvetica",
  fontStyle: "normal",
  fontSize: "16px",
  lineHeight: "26px",
  letterSpacing: "-0.01em",
  color: "#A5AFAE",
};

const numbersStyle = {
  fontFamily: "Helvetica",
  fontStyle: "normal",
  fontSize: "32px",
  lineHeight: "37px",
  letterSpacing: "-0.01em",
  color: "#ffffff",
};
const PrettyCountDown: React.FC<Props> = ({ date, setBiddingEnded }) => {
  const countdownRef = useRef<CountDown>(null);

  useEffect(() => {
    if (countdownRef && countdownRef.current) {
      countdownRef.current.start();
    }
  }, [date]);

  const renderer = ({
    days,
    hours,
    minutes,
    seconds,
  }: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div>
        <span style={numbersStyle}>{days}</span>
        <span style={textStyle}>{" Days"}</span>
      </div>
      <div>
        <span style={numbersStyle}>{hours}</span>
        <span style={textStyle}>{" Hours"}</span>
      </div>
      <div>
        <span style={numbersStyle}>{minutes}</span>
        <span style={textStyle}>{" Minutes"}</span>
      </div>
      <div>
        <span style={numbersStyle}>{seconds}</span>
        <span style={textStyle}>{" Seconds"}</span>
      </div>
    </div>
  );
  return (
    <CountDown
      onComplete={() => setBiddingEnded(true)}
      ref={countdownRef}
      date={date}
      renderer={renderer}
    />
  );
};

export default PrettyCountDown;
