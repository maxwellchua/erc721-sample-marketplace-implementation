import classNames from "classnames";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import File from "./File";
import FileUploadIcon from "./FileUploadIcon";
import styles from "./styles.module.scss";

interface Props {
  className?: string;
  dropZoneClassName?: string;
  fileTypes?: string[];
  id?: string;
  fileIndex?: number;
  instructionsTitle?: string;
  instructionsSubtitle?: string;
  onUpload?: (file: File, fileIndex?: number) => void;
  onRemove?: (fileIndex: number) => void;
}

const FileUpload: React.FC<Props> = ({
  className,
  dropZoneClassName,
  fileTypes = [],
  id,
  fileIndex,
  instructionsTitle,
  instructionsSubtitle,
  onUpload,
  onRemove,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      if (typeof onUpload === "function") {
        onUpload(acceptedFiles[0], fileIndex);
      }
    },
    [fileIndex, onUpload]
  );

  const handleDragEnter = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleRemove = useCallback(() => {
    if (typeof onRemove === "function" && typeof fileIndex === "number") {
      onRemove(fileIndex);
    }
  }, [fileIndex, onRemove]);

  const dropzone = useDropzone({
    accept: fileTypes,
    maxFiles: 1,
    multiple: false,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  });

  return (
    <div className={classNames(styles.formFileListItem, className)}>
      <div
        {...dropzone.getRootProps({
          className: classNames(
            styles.fileUpload,
            {
              [styles.dragging]: isDragging,
            },
            dropZoneClassName
          ),
        })}
      >
        <input {...dropzone.getInputProps({ id })} />

        <FileUploadIcon className={styles.fileUploadIcon} />

        {isDragging && (
          <FileUploadIcon className={styles.fileUploadIconDragging} />
        )}

        <p className={styles.fileUploadInstructionsTitle}>
          {instructionsTitle || (
            <>
              Drag and drop or <span className={styles.browse}>browse</span>
            </>
          )}
        </p>

        {instructionsSubtitle && (
          <p className={styles.fileUploadInstructionsSubtitle}>
            {instructionsSubtitle}
          </p>
        )}
      </div>

      <button
        className={classNames(styles.formFileListItemRemove, {
          invisible:
            typeof onRemove === "undefined" && typeof fileIndex === "undefined",
        })}
        onClick={handleRemove}
        type="button"
      >
        <img
          alt=""
          height={24}
          src="/static/images/icons/trash.svg"
          width={22}
        />
      </button>
    </div>
  );
};

export default FileUpload;
