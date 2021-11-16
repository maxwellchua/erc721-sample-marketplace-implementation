import { useContractKit } from "@celo-tools/use-contractkit";
import { useStore } from "@monofu/shared/lib/stores";
import Error from "next/error";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Spinner } from "react-bootstrap";

import Container from "components/Container";
import Page from "components/Page";
import { ROUTES } from "utils/routes";
import contractKitUtils from "utils/contractkit";

const ContractDeployment: React.FC = () => {
  const router = useRouter();
  const store = useStore();
  const {
    users: { current: currentUser },
  } = store;
  const { getConnectedKit } = useContractKit();
  const [loading, setLoading] = useState<boolean>(false);
  const [deployedCollectibleAddress, setCollectibleAddress] = useState<string>(
    ""
  );
  const [collectibleError, setCollectibleError] = useState<string>("");
  const [deployedMarketAddress, setMarketAddress] = useState<string>("");
  const [marketError, setMarketError] = useState<string>("");
  const [linked, setLinked] = useState<boolean>(false);
  const [linkError, setLinkError] = useState<string>("");

  useEffect(() => {
    if (store.loading) return;

    if (!currentUser) {
      router.push(ROUTES.login);
    } else if (!currentUser.address) {
      router.push(ROUTES.connect);
    }
  }, [currentUser, router, store.loading]);

  const handleDeploy = useCallback(async () => {
    setLoading(true);
    const kit = await getConnectedKit();
    const [
      success1,
      collectibleAddress,
    ] = await contractKitUtils.contract.deployInitialCollectibleContract(kit);
    if (!success1) {
      setCollectibleError(collectibleAddress);
      setLoading(false);
      return;
    }
    setCollectibleAddress(collectibleAddress);

    const [
      success2,
      marketAddress,
    ] = await contractKitUtils.contract.deployMarketContract(
      kit,
      collectibleAddress
    );
    if (!success2) {
      setMarketError(marketAddress);
      setLoading(false);
      return;
    }
    setMarketAddress(marketAddress);

    const [
      success3,
      error,
    ] = await contractKitUtils.contract.linkMarketToCollectible(
      kit,
      collectibleAddress,
      marketAddress
    );
    if (!success3) {
      setLinkError(error as string);
    } else {
      setLinked(true);
    }
    setLoading(false);
  }, [getConnectedKit]);

  if (currentUser && !currentUser.isSuperuser)
    return <Error statusCode={404} />;

  return (
    <Page title="Contract Deployment">
      <Container className="c-pt-xl justify-content-between">
        <Col sm={12}>
          <h3>Collectible Address: {deployedCollectibleAddress}</h3>
          {!!collectibleError && <div>{collectibleError}</div>}
        </Col>
        <Col sm={12}>
          <h3>Market Address: {deployedMarketAddress}</h3>
          {!!marketError && <div>{marketError}</div>}
        </Col>
        <Col sm={12}>
          <h3>Link Status: {linked}</h3>
          {!!linkError && <div>{linkError}</div>}
        </Col>
        <Col sm={12}>
          <Button disabled={loading} onClick={handleDeploy} variant="primary">
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                <span>Deploying...</span>
              </>
            ) : (
              "Deploy Contracts"
            )}
          </Button>
        </Col>
      </Container>
    </Page>
  );
};

export default ContractDeployment;
