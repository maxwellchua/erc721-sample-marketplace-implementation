import classNames from "classnames";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import moment from "moment-timezone";
import Select, { Theme } from "react-select";

import { SellType } from "utils/constants";
import Datetime from "react-datetime";
import { updateTimezone } from "utils/timezone";
import { useStore } from "@monofu/shared/lib/stores";
import NumberWithUnits from "components/NumberWithUnits";
import { ModalFormData } from "./constants";

import styles from "./styles.module.scss";
import "react-datetime/css/react-datetime.css";

interface Props {
  isShown: boolean;
  onClose: () => void;
  onSubmit: (data: ModalFormData) => void;
}

const selectStyles = {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  control: (provided: Record<string, string | number>, state: any) => ({
    ...provided,
    background: state.isDisabled ? "rgba(41,41,41, .3)" : "#292929",
    border: "2px solid #555555",
    padding: 15,
    height: 80,
    minHeight: 80,
  }),
  singleValue: (provided: Record<string, string | number>) => ({
    ...provided,
    color: "#ffffff",
  }),
  menu: (provided: Record<string, string | number>) => ({
    ...provided,
    background: "#292929",
    color: "#ffffff",
  }),
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  option: (provided: Record<string, string | number>, state: any) => ({
    ...provided,
    color: state.isSelected || state.isFocused ? "#121212" : "#ffffff",
  }),
};

const selectTheme = (theme: Theme) => ({
  ...theme,
  borderRadius: 5,
  border: "2px solid #555555",
  colors: {
    ...theme.colors,
    primary25: "#CFE4E4",
    primary: "#B4FEFE",
  },
});

const PlaceOnSaleModal: React.FC<Props> = ({ isShown, onClose, onSubmit }) => {
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const store = useStore();
  const {
    users: { current: currentUser },
  } = store;
  const timezones = moment.tz.names().map((tz) => ({ value: tz, label: tz }));
  const [sellType, setSellType] = useState<SellType>(SellType.instant);
  const [price, setPrice] = useState<number | undefined>(1);
  const now = moment();
  const [startDate, setStartDate] = useState<Date>(
    now.add(1, "hours").toDate()
  );
  const [endDate, setEndDate] = useState<Date>(now.add(1, "days").toDate());
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const timezoneRef = useRef<Select | null>(null);
  const [timezone, setTimezone] = useState(currentTimezone);
  const [timezoneError, setTimezoneError] = useState("");
  const commissionRate = currentUser ? currentUser.commissionRate : 5;

  const handleChangeSellType = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const eventTarget = event.target as HTMLButtonElement;
      const newSellType = Number(eventTarget.value) as SellType;
      setSellType(newSellType);
    },
    [setSellType]
  );

  const handleChangePrice = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const eventTarget = event.target as HTMLInputElement;
      const newPrice = Number(eventTarget.value);
      setPrice(newPrice || undefined);
    },
    []
  );
  const validateDates = useCallback(() => {
    if (!startDate) {
      setStartDateError("Enter the date");
      return false;
    }
    if (!endDate) {
      setEndDateError("Enter the date");
      return false;
    }

    if (Number.isNaN(startDate.getTime())) {
      setStartDateError("Incorrect format");
      return false;
    }
    if (Number.isNaN(endDate.getTime())) {
      setEndDateError("Incorrect format");
      return false;
    }
    if (timezone === "") {
      setTimezoneError("Please select a timezone");
      if (timezoneRef) {
        const { current } = timezoneRef;
        if (current) current.focus();
      }
      return false;
    }
    const start = updateTimezone(startDate, timezone);
    const end = updateTimezone(endDate, timezone);
    if (!start || !end) return false;
    if (start <= new Date()) {
      setStartDateError("Start date must be later than now");
      return false;
    }
    if (start > end) {
      setEndDateError("End date must be after start date");
      return false;
    }
    return true;
  }, [
    endDate,
    startDate,
    timezone,
    timezoneRef,
    setEndDateError,
    setStartDateError,
    setTimezoneError,
  ]);

  const handleOnSubmit = useCallback(() => {
    if (sellType === SellType.auction) {
      setStartDateError("");
      setEndDateError("");
      if (!validateDates()) return;
    }
    onSubmit({
      price,
      sellType,
      startDate: updateTimezone(startDate, timezone),
      endDate: updateTimezone(endDate, timezone),
    });
  }, [endDate, price, sellType, startDate, timezone, onSubmit, validateDates]);

  const totalAmount = useMemo(() => {
    if (price) {
      return price - (price * commissionRate) / 100;
    }
    return 0;
  }, [price, commissionRate]);

  const handleAuctionEndDateChange = useCallback(
    (date: string | moment.Moment) => {
      const current = new Date(date as string);
      setEndDate(current);
    },
    [setEndDate]
  );
  const handleAuctionStartDateChange = useCallback(
    (date: string | moment.Moment) => {
      const current = new Date(date as string);
      setStartDate(current);
    },
    [setStartDate]
  );

  const timezoneSelect = (
    <Select
      ref={timezoneRef}
      defaultValue={{ value: currentTimezone, label: currentTimezone }}
      options={timezones}
      styles={selectStyles}
      theme={selectTheme}
      onChange={(v: { value: string; label: string } | null) =>
        v && setTimezone(v.value)
      }
    />
  );

  return (
    <Modal
      show={isShown}
      centered
      dialogClassName={styles.placeOnSaleModal}
      onHide={onClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Put on sale</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="c-px-3">
          <p className={styles.saleTypeInfo}>Purchasing method</p>
          <button
            className={classNames(
              styles.saleTypeItem,
              sellType === SellType.instant && styles.selected
            )}
            onClick={handleChangeSellType}
            type="button"
            value={SellType.instant}
          >
            Instant Sale
          </button>
          <button
            className={classNames(
              styles.saleTypeItem,
              sellType === SellType.auction && styles.selected
            )}
            onClick={handleChangeSellType}
            type="button"
            value={SellType.auction}
          >
            Auction
          </button>
        </div>

        <Row
          className={classNames("c-mx-0", styles.saleTypeAmount, styles.first)}
        >
          <Col>
            <div>
              <p className={styles.saleTypeInfo}>
                {sellType === SellType.instant
                  ? "Token price"
                  : "Starting bidding price"}
              </p>
              <NumberWithUnits
                name="price"
                onChange={handleChangePrice}
                min={0}
                step=".01"
                required
                value={price}
                units="CUSD"
              />
            </div>
          </Col>
        </Row>

        {sellType === SellType.auction && (
          <>
            <Row className="c-mx-0">
              <Col md="6">
                <p className={styles.saleTypeInfo}>Start Date</p>
                <Datetime
                  className="dark-picker"
                  onChange={handleAuctionStartDateChange}
                  value={startDate}
                />
                <div className={styles.errorMsg}>{startDateError}</div>
              </Col>
              <Col md="6">
                <p className={styles.saleTypeInfo}>End Date</p>
                <Datetime
                  className="dark-picker"
                  onChange={handleAuctionEndDateChange}
                  value={endDate}
                />
                <div className={styles.errorMsg}>{endDateError}</div>
              </Col>
            </Row>
            <Row className="c-my-3 c-mx-0">
              <Col>
                <p className={styles.saleTypeInfo}>Timezone</p>
                {timezoneSelect}
                <div className={styles.errorMsg}>{timezoneError}</div>
              </Col>
            </Row>
          </>
        )}
        <Row className={classNames("c-mx-0", styles.saleTypeAmount)}>
          <Col className={styles.label}>Service fee:</Col>
          <Col className={styles.value}>{commissionRate}%</Col>
        </Row>
        <Row className={classNames("c-mx-0", styles.saleTypeAmount)}>
          <Col className={styles.label}>You will receive:</Col>
          <Col className={styles.value}>{totalAmount.toFixed(2)} CUSD</Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className={styles.footer}>
        <Button
          variant="primary"
          disabled={price ? price <= 0 : true}
          onClick={handleOnSubmit}
        >
          Continue
        </Button>
        <Button variant="light" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PlaceOnSaleModal;
