import React from "react";

import styles from "./styles.module.scss";

const fileTypeImages = {
  generic: "/static/images/uploads/generic.svg",
  "application/pdf": "/static/images/uploads/pdf.svg",
  "audio/mpeg": "/static/images/uploads/mp3.svg",
  "image/gif": "/static/images/uploads/gif.svg",
  "image/jpeg": "/static/images/uploads/jpeg.svg",
  "image/png": "/static/images/uploads/png.svg",
  "image/tiff": "/static/images/uploads/generic.svg",
  "image/webp": "/static/images/uploads/webp.svg",
  "video/mp4": "/static/images/uploads/mp4.svg",
};

interface Props {
  fileIndex: number;
  fileName: string;
  fileType: string;
  onRemove: (index: number) => void;
}

const File: React.FC<Props> = ({ fileIndex, fileName, fileType, onRemove }) => (
  <div className={styles.formFileListItem}>
    <div className="align-items-center d-flex flex-shrink-0 position-relative">
      <img
        alt=""
        height={64}
        src={fileTypeImages[fileType as never] || fileTypeImages.generic}
        width={64}
      />
    </div>

    <div className={styles.formFileListItemName}>{fileName}</div>

    <button
      className={styles.formFileListItemRemove}
      onClick={() => onRemove(fileIndex)}
      type="button"
    >
      <img alt="" height={24} src="/static/images/icons/trash.svg" width={22} />
    </button>
  </div>
);

export default File;
