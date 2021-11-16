import React from "react";

interface Props {
  className?: string;
}

const FileUploadIcon: React.FC<Props> = ({ className }) => (
  <svg
    className={className}
    width="60"
    height="44"
    viewBox="0 0 60 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M46.8819 44H34.009V30.8902H38.2632C39.3421 30.8902 39.9796 29.6546 39.3421 28.765L31.0666 17.2244C30.5394 16.483 29.4483 16.483 28.9211 17.2244L20.6457 28.765C20.0082 29.6546 20.6334 30.8902 21.7246 30.8902H25.9787V44H11.5611C5.12464 43.6417 0 37.5748 0 31.0014C0 26.4667 2.43972 22.5128 6.0564 20.3752C5.72538 19.4732 5.55374 18.5094 5.55374 17.4962C5.55374 12.8627 9.26849 9.11879 13.866 9.11879C14.859 9.11879 15.8153 9.29177 16.7103 9.62539C19.3707 3.94159 25.1083 0 31.7777 0C40.4087 0.0123561 47.5194 6.67228 48.3286 15.1609C54.9612 16.31 60 22.5004 60 29.5063C60 36.9941 54.2133 43.481 46.8819 44Z"
      fill="currentColor"
    />
  </svg>
);

export default FileUploadIcon;
