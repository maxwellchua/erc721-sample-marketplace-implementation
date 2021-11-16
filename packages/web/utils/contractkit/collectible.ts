import { ContractKit, StableToken } from "@celo/contractkit";
import Web3 from "web3";

import MarketJSON from "@celo-contracts/build/contracts/Market.json";
import config from "@monofu/shared/lib/config";
import { Item } from "@monofu/shared/lib/stores/models";

import { GAS_PRICE, MINT_BATCH_LIMIT, PERCENTAGE_MULTIPLIER } from "./base";

const getBaseTokenUri = (itemId: string) =>
  `${config.urls.api}${config.urls.metadata}${itemId}/`;

const getMarketInstance = (kit: ContractKit, contractAddress: string) => {
  const instance = new kit.web3.eth.Contract(
    MarketJSON.abi as any[],
    contractAddress
  );
  return instance;
};

export const createCollectible = async (
  performActions: (
    ...operations: ((kit: ContractKit) => any | Promise<any>)[]
  ) => Promise<any[]>,
  item: Item,
  commissionRate: number,
  creatorList: string[],
  shareList: number[],
  forSale: boolean,
  price: number,
  isAuction: boolean,
  startDate: Date | undefined,
  endDate: Date | undefined
) => {
  try {
    const actionResult = await performActions(async (kit: ContractKit) => {
      const address = kit.defaultAccount;
      const marketAddress = config.marketContractAddress;
      if (!address || !marketAddress) return undefined;

      const stableToken = await kit.contracts.getStableToken(
        "cUSD" as StableToken
      );
      const startBlockNumber = await kit.connection.getBlockNumber();
      const marketInstance = getMarketInstance(kit, marketAddress);

      const tokenUri = getBaseTokenUri(item.itemId);
      const commissionPercentage = commissionRate * PERCENTAGE_MULTIPLIER;
      const royaltyPercentage = item.royalties * PERCENTAGE_MULTIPLIER; // since we
      const creators = creatorList.length > 0 ? creatorList : [address];
      const creatorPercentages =
        shareList.length > 0
          ? shareList.map((n) => n * PERCENTAGE_MULTIPLIER)
          : [100 * PERCENTAGE_MULTIPLIER];
      const weiPrice = Web3.utils.toWei(price.toString());
      const startTimeSinceEpoch = startDate
        ? Math.floor(startDate.getTime() / 1000)
        : 0;
      const endTimeSinceEpoch = endDate
        ? Math.floor(endDate.getTime() / 1000)
        : 0;

      const repeats = Math.ceil(item.tokenAmt / MINT_BATCH_LIMIT);

      /* eslint-disable no-await-in-loop */
      for (let i = 0; i < repeats; i += 1) {
        const tokenAmount =
          i === repeats - 1 && item.tokenAmt % MINT_BATCH_LIMIT > 0
            ? item.tokenAmt % MINT_BATCH_LIMIT
            : MINT_BATCH_LIMIT;
        const batchForSale = i > 0 ? !isAuction : forSale;

        const transactionObject = await marketInstance.methods.createCollectible(
          tokenUri,
          tokenAmount,
          batchForSale,
          {
            commissionPercentage,
            royaltyPercentage,
            creators,
            creatorPercentages,
          },
          {
            isAuction,
            reservePrice: weiPrice,
            auctionStartTime: startTimeSinceEpoch,
            auctionEndTime: endTimeSinceEpoch,
          }
        );
        const transaction = await kit.sendTransactionObject(transactionObject, {
          feeCurrency: stableToken.address,
          from: address,
          gasPrice: GAS_PRICE,
        });
        await transaction.waitReceipt();
      }

      const events = await marketInstance.getPastEvents("LogNewCollectibles", {
        filter: { marketAddress, creator: address },
        fromBlock: startBlockNumber,
        toBlock: "latest",
      });
      return events.map((ev) => ({
        fromId: ev.returnValues.fromTokenId,
        toId: ev.returnValues.toTokenId,
      }));
    });
    return [true, actionResult[0]];
  } catch (error) {
    console.error(error);
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

export const checkCollectibleForSale = async (
  performActions: (
    ...operations: ((kit: ContractKit) => any | Promise<any>)[]
  ) => Promise<any[]>,
  tokenNumber: number
) => {
  try {
    const actionResult = await performActions(async (kit: ContractKit) => {
      const marketAddress = config.marketContractAddress;
      if (!marketAddress) return undefined;

      const marketInstance = getMarketInstance(kit, marketAddress);
      const tokenPrice = await marketInstance.methods
        .getTokenSalePrice(tokenNumber)
        .call();
      console.log("TOKENPRICE", tokenPrice);
      return true;
    });
    return actionResult[0];
  } catch (error) {
    console.error(error);
    return false;
  }
};
