import { useContractKit } from "@celo-tools/use-contractkit";
import { useStore } from "@monofu/shared/lib/stores";
import {
  APIAuctionInput,
  APIItemCollaboratorInput,
} from "@monofu/shared/lib/api/tokens";
import fileSize from "filesize";
import { observer } from "mobx-react-lite";
import Error from "next/error";
import { useRouter } from "next/router";
import Datetime from "react-datetime";
import moment from "moment-timezone";
import Select, { Theme } from "react-select";
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import { PlusLg } from "react-bootstrap-icons";
import Category from "components/Category";
import Container from "components/Container";
import TokenCard from "components/TokenCard";
import Page from "components/Page";
import { ROUTES } from "utils/routes";
import contractKitUtils from "utils/contractkit";
import classNames from "classnames";
import NumberWithUnits from "components/NumberWithUnits";
import { SellType } from "utils/constants";

import { updateTimezone } from "utils/timezone";
import File from "./File";
import FileUpload from "./FileUpload";
import styles from "./styles.module.scss";
import "react-datetime/css/react-datetime.css";

interface FormItemCollaboratorInput extends APIItemCollaboratorInput {
  uuid: string;
}

interface FormDataType {
  auction: APIAuctionInput;
  categoryIds: number[];
  collectibleFile: File | null;
  files: { uuid: string; upload: File | null }[];
  coverImg: File | null;
  description: string;
  name: string;
  numTokens: number;
  onSale: boolean;
  price: number;
  sellType: SellType;
  royalties: number;
  collaborators: FormItemCollaboratorInput[];
  is360Video: boolean;
}

const acceptedCollectibleFileTypes = [
  "application/pdf",
  "audio/mpeg",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
  "video/mp4",
  "video/quicktime",
];
const acceptedCoverFileTypes = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
];

const now = moment();
const defaultFormData: FormDataType = {
  auction: {
    startDate: now.add(1, "hours").toDate(),
    endDate: now.add(1, "days").toDate(),
  },
  categoryIds: [],
  collectibleFile: null,
  coverImg: null,
  files: [],
  description: "",
  name: "",
  numTokens: 1,
  onSale: false,
  sellType: 0,
  price: 1,
  royalties: 10,
  collaborators: [],
  is360Video: false,
};

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

const CollectibleNew: React.FC = observer(() => {
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezones = moment.tz.names().map((tz) => ({ value: tz, label: tz }));
  const router = useRouter();
  const store = useStore();
  const {
    categories: { map: categoryMap },
    users: { current: currentUser, userMap },
  } = store;
  const userArray = Array.from(userMap.values());
  const startErrorRef = useRef<HTMLDivElement | null>(null);
  const endErrorRef = useRef<HTMLDivElement | null>(null);
  const collectibleRef = useRef<HTMLDivElement | null>(null);
  const coverImgRef = useRef<HTMLDivElement | null>(null);
  const timezoneRef = useRef<Select | null>(null);
  const nameErrorRef = useRef<HTMLDivElement | null>(null);
  const priceErrorRef = useRef<HTMLDivElement | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [priceError, setPriceError] = useState<string>("");
  const [timezone, setTimezone] = useState(currentTimezone);
  const [startDateError, setStartDateError] = useState<string>("");
  const [endDateError, setEndDateError] = useState<string>("");
  const [collectibleErrorMsg, setCollectibleErrorMsg] = useState<string>("");
  const [coverImgErrorMsg, setCoverImgErrorMsg] = useState<string>("");
  const [nameErrorMsg, setNameErrorMsg] = useState<string>("");
  const [timezoneErrorMsg, setTimezoneErrorMsg] = useState<string>("");
  const [creatorSelectErrorMsg, setCreatorSelectErrorMsg] = useState<string>(
    ""
  );
  const [
    sharePercentageErrorMsg,
    setSharePercentageErrorMsg,
  ] = useState<string>("");
  const [isAddCreators, setIsAddCreators] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormDataType>(defaultFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const { performActions } = useContractKit();

  useEffect(() => {
    if (store.loading) return;

    if (!currentUser) {
      router.push(ROUTES.login);
    } else if (!currentUser.address) {
      router.push(ROUTES.connect);
    }
  }, [currentUser, router, store.loading]);

  useEffect(() => {
    (async () => {
      await store.categories.fetchCategoryList();
      await store.users.fetchUserList();
    })();
  }, [store]);

  const categories = Array.from(categoryMap.values());

  const coverImgPreview = useMemo(
    () =>
      formData.coverImg ? URL.createObjectURL(formData.coverImg) : undefined,
    [formData.coverImg]
  );

  const commissionRate = useMemo(
    () => (currentUser ? currentUser.commissionRate : 5),
    [currentUser]
  );

  const userSelectOptions = useMemo(() => {
    if (userArray && userArray.length > 0) {
      const selectedUserIds = formData.collaborators.map(
        (collaborator) => collaborator.user
      );

      return userArray
        .filter((user) => !selectedUserIds.includes(user.id) && user.address)
        .map((user) => ({ value: user.id, label: user.address }));
    }
    return [];
  }, [userArray, formData.collaborators]);

  const handleCategoryChange = useCallback(
    (categoryId: number) => {
      setFormData((prevState) => ({
        ...prevState,
        categoryIds: prevState.categoryIds.includes(categoryId)
          ? []
          : [categoryId],
      }));
    },
    [setFormData]
  );

  const handleCollectibleUpload = useCallback(
    (file: File) => {
      setFormData((prevState) => ({
        ...prevState,
        collectibleFile: file,
      }));
    },
    [setFormData]
  );

  // const handleAddFile = useCallback(() => {
  //   setFormData((prevState) => ({
  //     ...prevState,
  //     files: [...prevState.files, { uuid: uuidv4(), upload: null }],
  //   }));
  // }, [setFormData]);

  const handleExtraCollectibleUpload = useCallback(
    (file: File, fileIndex?: number) => {
      if (typeof fileIndex !== "undefined") {
        setFormData((prevState) => {
          const { files } = prevState;
          files[fileIndex].upload = file;
          return {
            ...prevState,
            files,
          };
        });
      }
    },
    [setFormData]
  );

  const handleRemoveExtraCollectible = useCallback(
    (fileIndex: number) => {
      setFormData((prevState) => {
        const { files } = prevState;
        files.splice(fileIndex, 1);
        return {
          ...prevState,
          files,
        };
      });
    },
    [setFormData]
  );

  const handleCoverImgUpload = useCallback(
    (file: File) => {
      setFormData((prevState) => ({
        ...prevState,
        coverImg: file,
      }));
    },
    [setFormData]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { checked, name, value },
      } = event;
      const newValue = ["onSale", "is360Video"].includes(name)
        ? checked
        : value;

      setFormData((prevState) => ({
        ...prevState,
        [name]: newValue,
      }));
    },
    [setFormData]
  );

  const handleAuctionEndDateChange = useCallback(
    (date: string | moment.Moment) => {
      const current = new Date(date as string);
      setFormData((prev) => ({
        ...prev,
        auction: {
          ...prev.auction,
          endDate: current,
        },
      }));
    },
    [setFormData]
  );
  const handleAuctionStartDateChange = useCallback(
    (date: string | moment.Moment) => {
      const current = new Date(date as string);
      setFormData((prev) => ({
        ...prev,
        auction: {
          ...prev.auction,
          startDate: current,
        },
      }));
    },
    [setFormData]
  );

  const handleCollectibleRemove = () => {
    setFormData((prevState) => ({
      ...prevState,
      collectibleFile: null,
      is360Video: false,
    }));
  };

  const handleCoverReplace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files) {
      setFormData((prevState) => ({
        ...prevState,
        coverImg: files[0],
      }));
    }
  };

  const handleCoverRemove = () => {
    setFormData((prevState) => ({
      ...prevState,
      coverImg: null,
    }));
  };

  const handleAddCreator = useCallback(() => {
    setFormData((prevState) => ({
      ...prevState,
      collaborators: [
        ...prevState.collaborators,
        {
          uuid: uuidv4(),
          user: undefined,
          sharePercentage: 0,
          walletToken: "",
        },
      ],
    }));
  }, [setFormData]);

  const handlesellTypeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { id } = event.target as HTMLButtonElement;
    if (id === "formInstantSaleEnabled") {
      setFormData((prevState) => ({
        ...prevState,
        onSale: prevState.sellType !== SellType.instant,
        sellType:
          prevState.sellType !== SellType.instant
            ? SellType.instant
            : SellType.none,
      }));
    } else if (id === "formAuctionEnabled") {
      setFormData((prevState) => ({
        ...prevState,
        onSale: prevState.sellType !== SellType.auction,
        sellType:
          prevState.sellType !== SellType.auction
            ? SellType.auction
            : SellType.none,
      }));
    }
  };

  const handleToggleIsAddCreators = useCallback(() => {
    if (currentUser && formData.collaborators.length === 0) {
      const { id: currentUserId, address } = currentUser;
      const defaultCollaborators = [
        {
          uuid: uuidv4(),
          user: currentUserId,
          walletToken: address,
          sharePercentage: 100.0,
        },
      ];

      setFormData((prev) => ({
        ...prev,
        collaborators: [...defaultCollaborators],
      }));
    }
    setIsAddCreators((prev) => !prev);
  }, [currentUser, formData.collaborators, setIsAddCreators, setFormData]);

  const validatePrice = () => {
    const { price, sellType } = formData;
    // NOTE: for some reason price's type is string even if it's specified type is number.
    const priceData = parseFloat(parseFloat(price.toString()).toFixed(2));

    if (sellType !== SellType.none && priceData === 0) {
      priceErrorRef.current?.focus();
      setPriceError("Please set an amount greater than 0.");
      return false;
    }
    return true;
  };

  const validateRequiredFields = () => {
    if (!formData.collectibleFile) {
      collectibleRef.current?.focus();
      setCollectibleErrorMsg("Please upload a file");
      return false;
    }

    if (!formData.coverImg) {
      coverImgRef.current?.focus();
      setCoverImgErrorMsg("Please upload a file");
      return false;
    }

    if (!formData.name) {
      nameErrorRef.current?.focus();
      setNameErrorMsg("This field is required");
      return false;
    }

    return true;
  };

  const validateAuctionDates = () => {
    const { auction } = formData;

    if (auction) {
      const { startDate, endDate } = auction;

      if (!startDate) {
        setStartDateError("Enter the date");
        startErrorRef.current?.focus();
        return false;
      } else if (Number.isNaN(startDate.getTime())) {
        setStartDateError("Incorrect format");
        startErrorRef.current?.focus();
        return false;
      }

      if (!endDate) {
        setEndDateError("Enter the date");
        endErrorRef.current?.focus();
        return false;
      } else if (Number.isNaN(endDate.getTime())) {
        setEndDateError("Incorrect format");
        endErrorRef.current?.focus();
        return false;
      }

      if (timezone === "") {
        setTimezoneErrorMsg("Please select a timezone");
        timezoneRef.current?.focus();
        return false;
      }

      const start = updateTimezone(startDate, timezone);
      const end = updateTimezone(endDate, timezone);

      if (start && end) {
        if (start <= new Date()) {
          setStartDateError("Start date must be later than now");
          startErrorRef.current?.focus();
          return false;
        } else if (start > end) {
          setEndDateError("End date must be after start date");
          endErrorRef.current?.focus();
          return false;
        }
      }
    }

    return true;
  };

  const validateCollaborators = () => {
    const { collaborators } = formData;

    const emptyUser = collaborators.some((collaborator) => !collaborator.user);
    if (emptyUser) {
      setCreatorSelectErrorMsg("Please select a user for all co-creators");
      return false;
    }

    const totalSharePercentage = collaborators.reduce((total, collaborator) => {
      const { sharePercentage } = collaborator;
      return total + (sharePercentage || 0);
    }, 0);

    if (totalSharePercentage !== 100.0) {
      setSharePercentageErrorMsg("Creator splits must add up to 100%");
      return false;
    }
    return true;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    (async () => {
      setCollectibleErrorMsg("");
      setCoverImgErrorMsg("");
      if (!validateRequiredFields()) return;

      setPriceError("");
      if (!validatePrice()) return;

      if (formData.sellType === SellType.auction) {
        setStartDateError("");
        setEndDateError("");
        setTimezoneErrorMsg("");
        if (!validateAuctionDates()) return;
      }

      if (isAddCreators) {
        setSharePercentageErrorMsg("");
        setCreatorSelectErrorMsg("");
        if (!validateCollaborators()) return;
      }

      setLoading(true);
      const data = new FormData();
      const creatorList: string[] = [];
      const shareList: number[] = [];
      let updatedStartDate: Date | undefined;
      let updatedEndDate: Date | undefined;
      data.append("creator", String(currentUser!.id));
      data.append("file1", formData.collectibleFile || "");
      data.append("cover_img", formData.coverImg || "");
      data.append("title", formData.name);
      data.append("description", formData.description);
      data.append("token_amt", String(formData.numTokens));
      data.append("on_sale", String(formData.onSale));
      data.append("sell_type", String(formData.sellType));
      data.append(
        "is_360_video",
        String(
          !!formData.collectibleFile &&
            !!formData.collectibleFile.type.match("video.*") &&
            formData.is360Video
        )
      );
      data.append("royalties", String(formData.royalties));
      data.append(
        "price",
        formData.sellType !== SellType.none ? String(formData.price) : "0"
      );
      formData.files
        .filter((file) => !!file.upload)
        .forEach((file, index) => {
          const { upload } = file;
          if (upload) {
            data.append(`files[${index}]file`, upload);
          }
        });

      if (isAddCreators) {
        formData.collaborators.forEach((collaborator, index) => {
          const { user: userId, walletToken, sharePercentage } = collaborator;
          data.append(`collaborators[${index}]user`, userId?.toString() || "");
          data.append(`collaborators[${index}]wallet_token`, walletToken || "");
          data.append(
            `collaborators[${index}]share_percentage`,
            sharePercentage ? sharePercentage.toString() : "0"
          );
          creatorList.push(walletToken || "");
          shareList.push(sharePercentage || 0);
        });
      }

      if (formData.categoryIds[0]) {
        data.append("category", String(formData.categoryIds[0]));
      }

      if (formData.sellType === SellType.auction) {
        updatedStartDate = updateTimezone(
          formData.auction.startDate as Date,
          timezone
        );
        updatedEndDate = updateTimezone(
          formData.auction.endDate as Date,
          timezone
        );
        if (!updatedEndDate || !updatedStartDate) return;
        data.append("auction.start_date", updatedStartDate.toISOString() || "");
        data.append("auction.end_date", updatedEndDate.toISOString() || "");
        data.append("auction.starting_bidding_price", String(formData.price));
      }

      const item = await store.items.createItem(currentUser!.token, data);
      if (item) {
        const [
          success,
          ids,
        ] = await contractKitUtils.collectible.createCollectible(
          performActions,
          item,
          commissionRate,
          creatorList,
          shareList,
          formData.sellType !== SellType.none,
          formData.price,
          formData.sellType === SellType.auction,
          updatedStartDate,
          updatedEndDate
        );
        if (success) {
          ids.forEach((mintId: any, index: number) => {
            data.append(`ids[${index}]from_id`, mintId.fromId);
            data.append(`ids[${index}]to_id`, mintId.toId);
          });
          await store.items.mintItemTokens(currentUser!.token, item.id, data);
          setLoading(false);
          router.push(ROUTES.usersCollectibles(currentUser!.id));
          return;
        } else {
          await store.items.deleteItem(currentUser!.token, item.id);
          // TODO: Display error in contract deployment
        }
      }
      // TODO: Display error in item creation
      setLoading(false);
    })();
  };

  if (currentUser && !currentUser.isSuperuser)
    return <Error statusCode={404} />;

  return (
    <>
      <Page title="Create Collectible">
        <Container className={classNames("c-pt-xl", styles.container)}>
          <main className={styles.main}>
            <header className="c-mb-l">
              <h1 className={styles.mainTitle}>Create collectible</h1>
            </header>

            <Form className={styles.form} onSubmit={handleSubmit}>
              <Form.Group controlId="formCollectible">
                <Form.Label>
                  Upload{" "}
                  <span className={styles.formLabelRequired}>(required)</span>
                </Form.Label>
                <Form.Text muted className="c-mt-0 c-mb-3">
                  This file is the one that will be minted to create your NFT.
                  It can be a static image or a movie file.
                </Form.Text>
                <div className={styles.formFileList}>
                  {formData.collectibleFile ? (
                    <div>
                      <File
                        fileIndex={0}
                        fileName={formData.collectibleFile.name}
                        fileType={formData.collectibleFile.type}
                        onRemove={handleCollectibleRemove}
                      />
                    </div>
                  ) : (
                    <div
                      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                      tabIndex={0}
                      ref={collectibleRef}
                    >
                      <FileUpload
                        fileTypes={acceptedCollectibleFileTypes}
                        id="formCollectible"
                        instructionsSubtitle="(PNG, GIF, WEBP, MP4 or MP3 files only. Max size 30MB.)"
                        onUpload={handleCollectibleUpload}
                      />
                      <span className={styles.errorMsg}>
                        {collectibleErrorMsg}
                      </span>
                    </div>
                  )}
                  {formData.files.map((file, fileIndex) => {
                    const { uuid, upload } = file;
                    if (upload) {
                      return (
                        <File
                          key={uuid}
                          fileIndex={fileIndex}
                          fileName={upload.name}
                          fileType={upload.type}
                          onRemove={handleRemoveExtraCollectible}
                        />
                      );
                    }

                    return (
                      <FileUpload
                        key={uuid}
                        fileTypes={acceptedCollectibleFileTypes}
                        fileIndex={fileIndex}
                        id="formCollectible"
                        instructionsSubtitle="(PNG, GIF, WEBP, MP4 or MP3 files only. Max size 30MB.)"
                        onUpload={handleExtraCollectibleUpload}
                        onRemove={handleRemoveExtraCollectible}
                      />
                    );
                  })}
                </div>
                {/* TODO: Comment out when viewing multiple files on item detail page is implemented. */}
                {/* <Button
                variant="outline-light"
                className="d-flex align-items-center"
                size="sm"
                onClick={handleAddFile}
              >
                <span className="c-mr-1">Add File</span> <PlusLg />
              </Button> */}
              </Form.Group>
              {!!formData.collectibleFile &&
                !!formData.collectibleFile.type.match("video.*") && (
                  <Form.Group controlId="formIs360Video">
                    <div className="d-flex">
                      <Form.Label
                        className={classNames(styles.smaller, "c-mr-2 c-mb-0")}
                      >
                        Is main file a 360° video?
                      </Form.Label>
                      <Form.Check
                        name="is360Video"
                        type="switch"
                        id="is-360-video-toggle"
                        checked={formData.is360Video}
                        onChange={handleInputChange}
                      />{" "}
                    </div>
                  </Form.Group>
                )}

              <Form.Group controlId="formCover">
                <Form.Label>
                  Cover Image{" "}
                  <span className={styles.formLabelRequired}>(required)</span>{" "}
                </Form.Label>
                <Form.Text muted className="c-mt-0 c-mb-3">
                  This is a promotional image that will appear in the galleries
                  and on the item detail page.
                </Form.Text>

                {formData.coverImg ? (
                  <div className={styles.formCoverFile}>
                    <div
                      className={styles.formCoverFilePreview}
                      style={{
                        backgroundImage: `url(${coverImgPreview})`,
                      }}
                    />

                    <div className={styles.formCoverFileDetails}>
                      <div className={styles.formCoverFileDetailsName}>
                        {formData.coverImg.name}
                      </div>

                      <div className={styles.formCoverFileDetailsSize}>
                        {fileSize(formData.coverImg.size)}
                      </div>

                      <div className={styles.formCoverFileDetailsReplace}>
                        <div className="d-inline-block position-relative">
                          <input
                            id="coverImg"
                            accept={acceptedCoverFileTypes.join(",")}
                            onChange={handleCoverReplace}
                            type="file"
                          />
                          Replace
                        </div>
                      </div>
                    </div>

                    <button
                      className={styles.formCoverFileRemove}
                      onClick={handleCoverRemove}
                      type="button"
                    >
                      <img
                        height={24}
                        src="/static/images/icons/trash.svg"
                        width={22}
                        alt=""
                      />
                    </button>
                  </div>
                ) : (
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                  <div tabIndex={0} ref={coverImgRef}>
                    <FileUpload
                      fileTypes={acceptedCoverFileTypes}
                      id="formCover"
                      instructionsSubtitle="(PNG, GIF or JPEG files. Ideal size is 350 x 300px)"
                      onUpload={handleCoverImgUpload}
                    />
                    <span className={styles.errorMsg}>{coverImgErrorMsg}</span>
                  </div>
                )}
              </Form.Group>

              <Form.Group controlId="formNumTokens">
                <Form.Label>Amount of tokens for sale</Form.Label>
                <Form.Text muted className="c-mt-0 c-mb-3">
                  You can sell multiple copies of your NFT. Choose
                  &ldquo;1&rdquo; if you want this collectible to be unique.
                </Form.Text>
                <Row>
                  <Col lg={3}>
                    <Form.Control
                      className={styles.formInputNumber}
                      min={1}
                      name="numTokens"
                      onChange={handleInputChange}
                      placeholder="1"
                      required
                      type="number"
                      value={formData.numTokens}
                    />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="formRoyalties">
                <Form.Label>Royalties</Form.Label>
                <Form.Text muted className="c-mt-0 c-mb-3">
                  As the original creator of this NFT, you can set a royalty so
                  you get paid a percentage each time a token is sold in the
                  future. Keep in mind that buyers may be attracted if the
                  royalty amount is lower.
                </Form.Text>
                <Row>
                  <Col lg={6}>
                    <div className={styles.numberWithUnitsfield}>
                      <NumberWithUnits
                        max={100}
                        min={0}
                        name="royalties"
                        onChange={handleInputChange}
                        placeholder="0"
                        step=".01"
                        required
                        units="%"
                        value={formData.royalties}
                      />
                    </div>
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group>
                <Form.Label>Purchasing method</Form.Label>
                <div className={styles.purchasingMethodList}>
                  <button
                    className={classNames(
                      styles.purchasingMethodItem,
                      formData.sellType === SellType.instant && styles.selected
                    )}
                    id="formInstantSaleEnabled"
                    onClick={handlesellTypeClick}
                    type="button"
                  >
                    Fixed price instant sale
                  </button>
                  <button
                    className={classNames(
                      styles.purchasingMethodItem,
                      formData.sellType === SellType.auction && styles.selected
                    )}
                    id="formAuctionEnabled"
                    onClick={handlesellTypeClick}
                    type="button"
                  >
                    Enable bidding
                  </button>
                </div>
              </Form.Group>

              {!!formData.sellType && (
                <>
                  <Row className="align-items-baseline">
                    <Col lg={6}>
                      <Form.Group
                        controlId="formPrice"
                        className={styles.formInputRowItem}
                      >
                        <Form.Label className={styles.smaller}>
                          {formData.sellType === SellType.instant
                            ? "Token price"
                            : "Starting bidding price"}
                        </Form.Label>
                        <div className={styles.numberWithUnitsfield}>
                          <NumberWithUnits
                            name="price"
                            onChange={handleInputChange}
                            min={0}
                            placeholder="0"
                            step=".01"
                            required
                            value={formData.price}
                            units="CUSD"
                          />
                        </div>
                        <div className={styles.errorMsg} ref={priceErrorRef}>
                          {priceError}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col lg={6}>
                      <Form.Label className={styles.smaller}>
                        Service fee: {commissionRate}%
                      </Form.Label>
                      {!!formData.price && (
                        <p>
                          You will receive{" "}
                          <span className="font-weight-bold">
                            $
                            {(
                              formData.price -
                              (formData.price * commissionRate) / 100
                            ).toFixed(2)}{" "}
                            CUSD
                          </span>
                        </p>
                      )}
                    </Col>
                  </Row>

                  {formData.sellType === SellType.auction && (
                    <>
                      <Form.Label className={styles.smaller}>
                        Auction duration
                      </Form.Label>
                      <Row>
                        <Col lg={6}>
                          <Form.Group controlId="formAuctionStartDate">
                            <Form.Label className={styles.smallest}>
                              Start date
                            </Form.Label>
                            <Datetime
                              className="dark-picker"
                              onChange={handleAuctionStartDateChange}
                              value={formData.auction.startDate}
                            />
                            <div // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                              tabIndex={0}
                              ref={startErrorRef}
                              className={styles.errorMsg}
                            >
                              {startDateError}
                            </div>
                          </Form.Group>
                        </Col>
                        <Col lg={6}>
                          <Form.Group controlId="formAuctionEndDate">
                            <Form.Label className={styles.smallest}>
                              End date
                            </Form.Label>
                            <Datetime
                              className="dark-picker"
                              onChange={handleAuctionEndDateChange}
                              value={formData.auction.endDate}
                            />
                            <div // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                              tabIndex={0}
                              ref={endErrorRef}
                              className={styles.errorMsg}
                            >
                              {endDateError}
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group controlId="timezone">
                        <Form.Label className={styles.smallest}>
                          Timezone
                        </Form.Label>
                        <Select
                          ref={timezoneRef}
                          defaultValue={{
                            value: currentTimezone,
                            label: currentTimezone,
                          }}
                          options={timezones}
                          styles={selectStyles}
                          theme={selectTheme}
                          onChange={(
                            v: { value: string; label: string } | null
                          ) => v && setTimezone(v.value)}
                        />
                        <div className={styles.errorMsg}>
                          {timezoneErrorMsg}
                        </div>
                      </Form.Group>
                    </>
                  )}
                </>
              )}

              <Form.Group controlId="formName">
                <Form.Label>
                  Name{" "}
                  <span className={styles.formLabelRequired}>(required)</span>
                </Form.Label>
                <Form.Control
                  name="name"
                  onChange={handleInputChange}
                  placeholder="“Original artwork by&hellip;”"
                  type="text"
                  value={formData.name}
                />

                <div ref={nameErrorRef} className={styles.errorMsg}>
                  {nameErrorMsg}
                </div>
              </Form.Group>

              <Form.Group controlId="formDescription">
                <Form.Label>Description </Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  onChange={handleInputChange}
                  placeholder="“This purchase also grants you access to&hellip;”"
                  rows={4}
                  value={formData.description}
                />
              </Form.Group>

              <Form.Group controlId="formCategory">
                <Form.Label>Category</Form.Label>
                <div className={styles.formCategories}>
                  {categories.map(({ id, name }) => (
                    <Category
                      active={formData.categoryIds.includes(id)}
                      className={styles.formCategoriesItem}
                      id={id}
                      key={id}
                      name={name}
                      onClick={handleCategoryChange}
                    />
                  ))}
                </div>
              </Form.Group>

              <Form.Group controlId="formCreators" className="c-mb-5">
                <Form.Label>Creators</Form.Label>
                <Form.Text muted className="c-mt-0 c-mb-3">
                  You can add collaborators so they can get paid immediately on
                  both the initial sales and royalties.
                </Form.Text>
                <div className="d-flex justify-content-between">
                  <Form.Label className={styles.smaller}>
                    Add additional creators
                  </Form.Label>
                  <Form.Check
                    className="c-p-0"
                    type="switch"
                    id="collaborator-toggle"
                    checked={isAddCreators}
                    onChange={handleToggleIsAddCreators}
                  />
                </div>
                <span className={styles.errorMsg}>{creatorSelectErrorMsg}</span>
                {isAddCreators && (
                  <>
                    {formData.collaborators.map((additionalCreator, index) => {
                      const {
                        uuid,
                        user,
                        walletToken,
                        sharePercentage,
                      } = additionalCreator;

                      return (
                        <div key={uuid} className="c-mb-3">
                          <Row className="align-items-center">
                            <Col xs={4}>
                              <Form.Label className={styles.smaller}>
                                Creator #{index + 1}
                              </Form.Label>
                            </Col>
                            <Col xs={7} className="d-flex justify-content-end">
                              {index === 0 && (
                                <span className={styles.errorMsg}>
                                  {sharePercentageErrorMsg}
                                </span>
                              )}
                            </Col>
                          </Row>
                          <Row className="align-items-center justify-content-between">
                            <Col xs={7}>
                              <Select
                                value={{ value: user, label: walletToken }}
                                options={userSelectOptions}
                                styles={selectStyles}
                                theme={selectTheme}
                                isDisabled={index === 0}
                                noOptionsMessage={() => "No Users"}
                                onChange={(selected) => {
                                  setFormData((prev) => {
                                    const { collaborators } = prev;
                                    collaborators[index].user =
                                      selected?.value || undefined;
                                    collaborators[index].walletToken =
                                      selected?.label || "";
                                    return {
                                      ...prev,
                                      collaborators,
                                    };
                                  });
                                }}
                              />
                            </Col>
                            <Col xs={4}>
                              <NumberWithUnits
                                max={100}
                                min={0}
                                className="c-px-2"
                                value={sharePercentage}
                                name="royalties"
                                onChange={(
                                  event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const {
                                    target: { value },
                                  } = event;
                                  setFormData((prev) => {
                                    const { collaborators } = prev;
                                    collaborators[
                                      index
                                    ].sharePercentage = parseFloat(value);
                                    return {
                                      ...prev,
                                      collaborators,
                                    };
                                  });
                                }}
                                placeholder="0"
                                step=".01"
                                required
                                units="%"
                              />
                            </Col>
                            <Col
                              xs={1}
                              className={classNames("c-px-0", {
                                invisible: index === 0,
                              })}
                            >
                              <button
                                className={classNames(
                                  styles.formFileListItemRemove,
                                  "c-mx-auto"
                                )}
                                onClick={() => {
                                  setFormData((prev) => {
                                    const { collaborators } = prev;
                                    collaborators.splice(index, 1);
                                    return {
                                      ...prev,
                                      collaborators,
                                    };
                                  });
                                }}
                                type="button"
                              >
                                <img
                                  alt=""
                                  height={24}
                                  src="/static/images/icons/trash.svg"
                                  width={22}
                                />
                              </button>
                            </Col>
                          </Row>
                          {/* <Form.Text muted>{walletToken}</Form.Text> */}
                        </div>
                      );
                    })}
                    <Button
                      variant="outline-light"
                      size="sm"
                      className="d-flex align-items-center"
                      onClick={handleAddCreator}
                    >
                      <span className="c-mr-1">Add Creator</span> <PlusLg />
                    </Button>
                  </>
                )}
              </Form.Group>

              <Button
                variant="outline-secondary"
                onClick={() => setShowPreview(true)}
                className={classNames(styles.formButton, "d-lg-none c-mb-3")}
              >
                Preview
              </Button>
              <Button
                className={classNames(styles.formSubmit, styles.formButton)}
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />{" "}
                    <span>Creating...</span>
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </Form>
          </main>

          <aside className={classNames(styles.sidebar, "d-none d-lg-block")}>
            <h2 className={styles.sidebarTitle}>Preview</h2>
            <TokenCard
              className={styles.sidebarCollectible}
              isPreview
              id={0}
              auction={null}
              onSale={!!formData.sellType}
              ownerName={currentUser?.displayName || ""}
              ownerId={0}
              price={formData.price}
              sellType={formData.sellType}
              supply={formData.numTokens}
              contractAddress=""
              coverImg={coverImgPreview}
              collectibleId={0}
              title={formData.name || "—"}
              tokenAmt={formData.numTokens}
              tokenNumber={formData.numTokens}
              mintId={0}
            />
          </aside>
        </Container>
      </Page>

      <Modal
        centered
        show={showPreview}
        onHide={() => setShowPreview(false)}
        dialogClassName={styles.previewModalDialog}
      >
        <TokenCard
          className={styles.sidebarCollectible}
          isPreview
          id={0}
          auction={null}
          onSale={!!formData.sellType}
          ownerName={currentUser?.displayName || ""}
          ownerId={0}
          price={formData.price}
          sellType={formData.sellType}
          supply={formData.numTokens}
          contractAddress=""
          coverImg={coverImgPreview}
          collectibleId={0}
          title={formData.name || "—"}
          tokenAmt={formData.numTokens}
          tokenNumber={formData.numTokens}
          mintId={0}
        />
      </Modal>

      <Modal
        size="sm"
        centered
        show={loading}
        onHide={() => null}
        contentClassName={styles.loadingModalContent}
      >
        <Spinner
          as="span"
          animation="border"
          role="status"
          aria-hidden="true"
        />
        <span>Creating...</span>
      </Modal>
    </>
  );
});

export default CollectibleNew;
