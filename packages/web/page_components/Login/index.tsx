import { APILoginInput } from "@monofu/shared/lib/api/auth";
import { useStore } from "@monofu/shared/lib/stores";
import Container from "components/Container";
import Page from "components/Page";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { APP_NAME } from "utils/constants";
import { ROUTES } from "utils/routes";

import styles from "./styles.module.scss";

const Login: React.FC = () => {
  const router = useRouter();
  const store = useStore();
  const {
    users: { current: currentUser },
  } = store;
  const {
    control,
    formState: { isSubmitting, errors },
    handleSubmit,
  } = useForm();
  const [generalError, setGeneralError] = useState<string>("");

  useEffect(() => {
    if (store.loading) return;

    if (currentUser) {
      router.push(ROUTES.usersDetail(currentUser.id));
    }
  }, [currentUser, router, store.loading]);

  const handleLogin = useCallback(
    async (data: APILoginInput) => {
      setGeneralError("");
      try {
        await store.users.login(data);
      } catch (error) {
        const { message: detail } = error as Error;
        if (detail) {
          Object.entries(JSON.parse(detail)!).forEach(([, message]) => {
            setGeneralError(message as string);
          });
        }
      }
    },
    [store]
  );

  return (
    <Page title="Log In">
      <Container className="c-pt-xl">
        <div className={styles.loginBox}>
          <Form onSubmit={handleSubmit(handleLogin)}>
            <div className="w-100 text-center c-mb-3">
              <div className={styles.logoContainer}>
                <img
                  className="w-100 h-100"
                  alt={APP_NAME}
                  src="/static/images/logo.svg"
                />
              </div>
            </div>
            {!!generalError && (
              <div className="c-mb-3 text-danger">{generalError}</div>
            )}
            <Form.Group controlId="formUsername" className="c-mb-3">
              <Controller
                control={control}
                name="username"
                rules={{ required: true }}
                defaultValue=""
                render={({ field }) => (
                  <Form.Control
                    placeholder="Username"
                    {...field}
                    isInvalid={!!errors.username}
                  />
                )}
              />
              {!!errors.username && errors.username.type === "required" && (
                <Form.Control.Feedback type="invalid">
                  Username is required
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group controlId="formPassword">
              <Controller
                control={control}
                name="password"
                rules={{ required: true }}
                defaultValue=""
                render={({ field }) => (
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    {...field}
                    isInvalid={!!errors.password}
                    autoComplete="on"
                  />
                )}
              />
              {!!errors.password && errors.password.type === "required" && (
                <Form.Control.Feedback type="invalid">
                  Password is required
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-100 c-mb-0"
            >
              Log In
            </Button>
            {/* <div className="w-100 text-center">
              <a href="#">Forgot Password?</a>
            </div>
            <hr className={styles.divider} />
            <Button variant="outline-secondary" className="w-100">
              Create New Account
            </Button> */}
          </Form>
        </div>
      </Container>
    </Page>
  );
};

export default observer(Login);
