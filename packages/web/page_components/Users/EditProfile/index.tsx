import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Page from "components/Page";
import { ROUTES } from "utils/routes";
import { Form } from "react-bootstrap";
import Container from "components/Container";
import Breadcrumb, { BreadcrumbLink } from "components/Breadcrumb";
import { FormProvider, useForm } from "react-hook-form";
import { APIUserUpdateInput } from "@monofu/shared/lib/api/users";
import { useStore } from "@monofu/shared/lib/stores";

import styles from "./styles.module.scss";
import ProfileForm from "./ProfileForm";

const EditProfile: React.FC = () => {
  const router = useRouter();
  const store = useStore();
  const {
    users: { current: currentUser },
  } = store;
  const methods = useForm();
  const [breadCrumbs, setBreadCrumbs] = useState<BreadcrumbLink[]>([]);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState<boolean>(false);

  useEffect(() => {
    if (store.loading) return;

    if (!currentUser) {
      router.push(ROUTES.login);
    }
  }, [currentUser, router, store.loading]);

  useEffect(() => {
    if (currentUser) {
      const breadCrumbsLinks = [
        {
          label: "Profile",
          href: ROUTES.usersDetail(currentUser.id),
          isActive: false,
        },
        {
          label: "Edit Profile",
          href: "",
          isActive: true,
        },
      ];
      setBreadCrumbs(breadCrumbsLinks);
    }
  }, [currentUser, store]);

  const handleUpdate = useCallback(
    async (data: APIUserUpdateInput) => {
      if (currentUser) {
        try {
          await store.users.updateUserInfo(currentUser.token, data);
        } catch (e) {
          // SetError
        }
        setIsSubmitSuccessful(true);
        setTimeout(() => setIsSubmitSuccessful(false), 2000);
      }
    },
    [currentUser, store.users]
  );

  if (!currentUser) {
    return null;
  }

  return (
    <Page title="Edit Profile">
      <Breadcrumb items={breadCrumbs} />
      <Container>
        <main className="c-px-5">
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Edit Profile</h1>
            <p className={styles.pageDescription}>
              Set your personal preferences, add your details and describe what
              you are all about.
            </p>
          </header>

          <FormProvider {...methods}>
            <Form onSubmit={methods.handleSubmit(handleUpdate)}>
              <ProfileForm
                instance={currentUser}
                isSubmitSuccessful={isSubmitSuccessful}
              />
            </Form>
          </FormProvider>
        </main>
      </Container>
    </Page>
  );
};

export default observer(EditProfile);
