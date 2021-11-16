import { observer } from "mobx-react-lite";
import { User } from "@monofu/shared/lib/stores/models";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Button, Col, Form } from "react-bootstrap";
import classNames from "classnames";
import ProfileImageUpload from "./ProfileImageUpload";

import styles from "./styles.module.scss";

interface Props {
  instance: User;
  isSubmitSuccessful: boolean;
}

const ProfileForm: React.FC<Props> = ({ instance, isSubmitSuccessful }) => {
  const {
    control,
    formState: { isDirty, isSubmitting, errors },
  } = useFormContext();

  return (
    <Form.Row>
      <Col lg={6}>
        <ProfileImageUpload defaultValue={instance.profileImage} />
      </Col>
      <Col lg={6}>
        <div className="c-mb-5">
          <h6
            className={classNames(styles.sectionTitle, styles.accountInfoTitle)}
          >
            Account information
          </h6>
          <Form.Group>
            <Form.Label className={styles.label}>First name</Form.Label>
            <Controller
              name="firstName"
              control={control}
              defaultValue={instance.firstName}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  placeholder="Enter you first name"
                  {...field}
                  isInvalid={errors.firstName}
                />
              )}
            />
            {errors.firstName && (
              <Form.Control.Feedback type="invalid">
                {errors.firstName.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label className={styles.label}>Last name</Form.Label>
            <Controller
              name="lastName"
              control={control}
              defaultValue={instance.lastName}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  placeholder="Enter you last name"
                  {...field}
                  isInvalid={errors.lastName}
                />
              )}
            />
            {errors.lastName && (
              <Form.Control.Feedback type="invalid">
                {errors.lastName.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label className={styles.label}>Bio</Form.Label>
            <Controller
              name="description"
              control={control}
              defaultValue={instance.description}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  as="textarea"
                  rows={3}
                  className={styles.textarea}
                  placeholder="About yourself in a few words"
                  {...field}
                  isInvalid={errors.description}
                />
              )}
            />
          </Form.Group>
        </div>
        <div className={styles.socialForm}>
          <h6 className={styles.sectionTitle}>Social</h6>
          <Form.Group>
            <Form.Label className={styles.label}>Instagram</Form.Label>
            <Controller
              name="instagram"
              control={control}
              defaultValue={instance.instagram}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  placeholder="Enter URL"
                  {...field}
                  isInvalid={errors.instagram}
                />
              )}
            />
            {errors.instagram && (
              <Form.Control.Feedback type="invalid">
                {errors.instagram.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label className={styles.label}>Messenger</Form.Label>
            <Controller
              name="messenger"
              control={control}
              defaultValue={instance.messenger}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  placeholder="Enter URL"
                  {...field}
                  isInvalid={errors.messenger}
                />
              )}
            />
            {errors.messenger && (
              <Form.Control.Feedback type="invalid">
                {errors.messenger.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label className={styles.label}>Twitter</Form.Label>
            <Controller
              name="twitter"
              control={control}
              defaultValue={instance.twitter}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  placeholder="Enter URL"
                  {...field}
                  isInvalid={errors.twitter}
                />
              )}
            />
            {errors.twitter && (
              <Form.Control.Feedback type="invalid">
                {errors.twitter.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>

        <Button
          className={styles.updateSettingsButton}
          disabled={!isDirty || isSubmitting}
          type="submit"
        >
          {isSubmitSuccessful ? "Success" : "Update Profile"}
        </Button>
      </Col>
    </Form.Row>
  );
};

export default observer(ProfileForm);
