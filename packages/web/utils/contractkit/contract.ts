import { toTransactionObject } from "@celo/connect";
import { ContractKit, StableToken } from "@celo/contractkit";

import CollectibleJSON from "@celo-contracts/build/contracts/Collectible.json";
import MarketJSON from "@celo-contracts/build/contracts/Market.json";
import config from "@monofu/shared/lib/config";

import { GAS_PRICE } from "./base";

const getCollectibleInstance = (kit: ContractKit, contractAddress: string) => {
  const instance = new kit.web3.eth.Contract(
    CollectibleJSON.abi as any[],
    contractAddress
  );
  return instance;
};

export const deployInitialCollectibleContract = async (kit: ContractKit) => {
  try {
    const address = kit.defaultAccount;
    const contract = new kit.web3.eth.Contract(CollectibleJSON.abi as any[]);
    const transaction = toTransactionObject(
      kit.connection,
      // eslint-disable-next-line
      // @ts-ignore - web3 Object instead of CeloTxObject
      contract.deploy({
        data: CollectibleJSON.bytecode,
        arguments: [address],
      })
    );
    // eslint-disable-next-line
    // @ts-ignore - https://github.com/celo-org/celo-monorepo/issues/3514
    const deployReceipt = await transaction.sendAndWaitForReceipt({
      from: address,
      gasPrice: GAS_PRICE,
    });
    return [true, deployReceipt.contractAddress];
  } catch (error: unknown) {
    console.error(error);
    let errorString: string;
    if (typeof error === "string") {
      errorString = error.toUpperCase();
    } else if (error instanceof Error) {
      errorString = error.message;
    } else {
      errorString = "ERROR";
    }
    return [false, errorString];
  }
};

export const deployMarketContract = async (
  kit: ContractKit,
  collectibleAddress: string
) => {
  try {
    const address = kit.defaultAccount;
    const stableToken = await kit.contracts.getStableToken(
      "cUSD" as StableToken
    );
    const contract = new kit.web3.eth.Contract(MarketJSON.abi as any[]);
    const transaction = toTransactionObject(
      kit.connection,
      // eslint-disable-next-line
      // @ts-ignore - web3 Object instead of CeloTxObject
      contract.deploy({
        data: MarketJSON.bytecode,
        arguments: [
          collectibleAddress,
          stableToken.address,
          config.marketCommissionRecipient,
        ],
      })
    );
    // eslint-disable-next-line
    // @ts-ignore - https://github.com/celo-org/celo-monorepo/issues/3514
    const deployReceipt = await transaction.sendAndWaitForReceipt({
      from: address,
      gasPrice: GAS_PRICE,
    });
    return [true, deployReceipt.contractAddress];
  } catch (error: unknown) {
    console.error(error);
    let errorString: string;
    if (typeof error === "string") {
      errorString = error.toUpperCase();
    } else if (error instanceof Error) {
      errorString = error.message;
    } else {
      errorString = "ERROR";
    }
    return [false, errorString];
  }
};

export const linkMarketToCollectible = async (
  kit: ContractKit,
  collectibleAddress: string,
  marketAddress: string
) => {
  try {
    const address = kit.defaultAccount;
    const collectibleInstance = getCollectibleInstance(kit, collectibleAddress);
    const transactionObject = await collectibleInstance.methods.setMarketAddress(
      marketAddress
    );
    const transaction = await kit.sendTransactionObject(transactionObject, {
      from: address,
      gasPrice: GAS_PRICE,
    });
    await transaction.waitReceipt();
    return [true, ""];
  } catch (error: unknown) {
    console.error(error);
    let errorString: string;
    if (typeof error === "string") {
      errorString = error.toUpperCase();
    } else if (error instanceof Error) {
      errorString = error.message;
    } else {
      errorString = "ERROR";
    }
    return [false, errorString];
  }
};
