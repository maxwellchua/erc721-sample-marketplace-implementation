import { useStore } from "@monofu/shared/lib/stores";
import { observer } from "mobx-react-lite";
import React, { useCallback, useRef, useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
// import { useFormContext } from "react-hook-form";

import Avatar from "components/Avatar";
import styles from "./styles.module.scss";

interface Props {
  defaultValue: string | null;
}

const ProfileImageUpload: React.FC<Props> = ({ defaultValue }) => {
  // const { register, setValue } = useFormContext();
  const store = useStore();
  const profileImageRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(defaultValue);
  const {
    users: { current: currentUser },
  } = store;

  // useEffect(() => {
  //   register("profileImage");
  // }, [register]);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (currentUser && e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("profile_image", file);
        try {
          await store.users.updateProfileImage(currentUser.token, formData);
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const { result } = reader;
            if (result && typeof result === "string") {
              setPreview(result);
            }
          };
        } catch (error) {
          // SetError
        }
        // setValue("profileImage", file, { shouldDirty: true });
      }
    },
    [currentUser, store] // [setValue]
  );

  const handleClick = useCallback(() => {
    profileImageRef.current?.click();
  }, [profileImageRef]);

  return (
    <Form.Row className={styles.profilePhotoForm}>
      <Col xs={4} md={6}>
        <Avatar
          className="d-block d-sm-none c-mx-auto"
          size={56}
          src={preview}
        />
        <Avatar
          className="d-none d-sm-block d-md-none c-mx-auto"
          size={64}
          src={preview}
        />
        <Avatar
          className="d-none d-md-block d-xl-none c-mx-auto"
          size={150}
          src={preview}
        />
        <Avatar
          className="d-none d-xl-block c-mx-auto"
          size={187}
          src={preview}
        />
      </Col>
      <Form.Group as={Col}>
        <Form.Label className={styles.label}>Profile Photo</Form.Label>
        <p className={styles.profilePhotoText}>
          We recommend an image of at least 400x400 Gifs work too 🙌
        </p>
        <input
          type="file"
          ref={profileImageRef}
          accept="image/*"
          className="d-none"
          onChange={handleChange}
        />
        <Button onClick={handleClick} variant="outline-light">
          Upload
        </Button>
      </Form.Group>
    </Form.Row>
  );
};

export default observer(ProfileImageUpload);
