import { ContractKit, StableToken } from "@celo/contractkit";
import config from "@monofu/shared/lib/config";
import Web3 from "web3";
import BigNumber from "bignumber.js";

import MarketJSON from "@celo-contracts/build/contracts/Market.json";
import { GAS_PRICE } from "./base";

const getMarketInstance = (kit: ContractKit, contractAddress: string) => {
  const instance = new kit.web3.eth.Contract(
    MarketJSON.abi as any[],
    contractAddress
  );
  return instance;
};

export const putTokenForSale = async (
  performActions: (
    ...operations: ((kit: ContractKit) => any | Promise<any>)[]
  ) => Promise<any[]>,
  tokenId: number,
  isAuction: boolean,
  startDate: string,
  endDate: string,
  price: number
) => {
  try {
    const actionResult = await performActions(async (kit: ContractKit) => {
      const address = kit.defaultAccount;
      const marketAddress = config.marketContractAddress;
      if (!marketAddress) return false;

      const stableToken = await kit.contracts.getStableToken(
        "cUSD" as StableToken
      );
      const marketInstance = getMarketInstance(kit, marketAddress);

      const weiPrice = Web3.utils.toWei(price.toString());
      const startTimeSinceEpoch = isAuction
        ? Math.floor(new Date(startDate).getTime() / 1000)
        : 0;
      const endTimeSinceEpoch = isAuction
        ? Math.floor(new Date(endDate).getTime() / 1000)
        : 0;

      const transactionObject = await marketInstance.methods.putTokenForSale(
        tokenId,
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
      return true;
    });
    return actionResult[0];
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const purchaseToken = async (
  performActions: (
    ...operations: ((kit: ContractKit) => any | Promise<any>)[]
  ) => Promise<any[]>,
  tokenId: number
) => {
  try {
    const actionResult = await performActions(
      async (kit: ContractKit) => {
        const address = kit.defaultAccount;
        const marketAddress = config.marketContractAddress;
        if (!address || !marketAddress) return false;

        const stableToken = await kit.contracts.getStableToken(
          "cUSD" as StableToken
        );
        const marketInstance = getMarketInstance(kit, marketAddress);
        const tokenPrice = await marketInstance.methods
          .getTokenSalePrice(tokenId)
          .call();
        const allowance = await stableToken.allowance(address, marketAddress);
        const tokenPriceBN = new BigNumber(tokenPrice);
        if (allowance.comparedTo(tokenPriceBN) >= 0) return true;

        const approveTx = await stableToken
          .increaseAllowance(marketAddress, tokenPrice)
          // eslint-disable-next-line
          // @ts-ignore - https://github.com/celo-org/celo-monorepo/issues/3514
          .send({
            feeCurrency: stableToken.address,
            from: address,
            gasPrice: GAS_PRICE,
          });
        const receipt = await approveTx.waitReceipt();
        // console.log(receipt);
        return receipt;
      },
      async (kit: ContractKit) => {
        const address = kit.defaultAccount;
        const marketAddress = config.marketContractAddress;
        if (!address || !marketAddress) {
          return { success: false, message: "Invalid configuration" };
        }

        const stableToken = await kit.contracts.getStableToken(
          "cUSD" as StableToken
        );
        const marketInstance = getMarketInstance(kit, marketAddress);
        const tokenPrice = await marketInstance.methods
          .getTokenSalePrice(tokenId)
          .call();
        const allowance = await stableToken.allowance(address, marketAddress);
        const tokenPriceBN = new BigNumber(tokenPrice);
        if (allowance.comparedTo(tokenPriceBN) < 0) {
          return {
            success: false,
            message:
              "cUSD transfer approval has not taken effect yet. Please try again later.",
          };
        }

        const transactionObject = await marketInstance.methods.purchaseToken(
          tokenId
        );
        const transaction = await kit.sendTransactionObject(transactionObject, {
          feeCurrency: stableToken.address,
          from: address,
          gasPrice: GAS_PRICE,
        });
        await transaction.waitReceipt();
        // console.log(receipt);
        return { success: true, message: "" };
      }
    );
    return actionResult[1];
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
    return { success: false, message: errorString };
  }
};

export const placeTokenBid = async (
  performActions: (
    ...operations: ((kit: ContractKit) => any | Promise<any>)[]
  ) => Promise<any[]>,
  tokenId: number,
  bid: number
) => {
  try {
    const actionResult = await performActions(
      async (kit: ContractKit) => {
        const address = kit.defaultAccount;
        const marketAddress = config.marketContractAddress;
        if (!address || !marketAddress) return false;

        const stableToken = await kit.contracts.getStableToken(
          "cUSD" as StableToken
        );
        const weiBid = Web3.utils.toWei(bid.toString());
        const allowance = await stableToken.allowance(address, marketAddress);
        const weiBidBN = new BigNumber(weiBid);
        if (allowance.comparedTo(weiBidBN) >= 0) return true;

        const approveTx = await stableToken
          .increaseAllowance(marketAddress, weiBid)
          // eslint-disable-next-line
          // @ts-ignore - https://github.com/celo-org/celo-monorepo/issues/3514
          .send({
            feeCurrency: stableToken.address,
            from: address,
            gasPrice: GAS_PRICE,
          });
        const receipt = await approveTx.waitReceipt();
        // console.log(receipt);
        return receipt;
      },
      async (kit: ContractKit) => {
        const address = kit.defaultAccount;
        const marketAddress = config.marketContractAddress;
        if (!address || !marketAddress) {
          return { success: false, message: "Invalid configuration" };
        }

        const stableToken = await kit.contracts.getStableToken(
          "cUSD" as StableToken
        );
        const marketInstance = getMarketInstance(kit, marketAddress);
        const weiBid = Web3.utils.toWei(bid.toString());
        const allowance = await stableToken.allowance(address, marketAddress);
        const weiBidBN = new BigNumber(weiBid);
        if (allowance.comparedTo(weiBidBN) < 0) {
          return {
            success: false,
            message:
              "cUSD transfer approval has not taken effect yet. Please try again later.",
          };
        }
        const transactionObject = await marketInstance.methods.createBid(
          tokenId,
          weiBid
        );
        const transaction = await kit.sendTransactionObject(transactionObject, {
          feeCurrency: stableToken.address,
          from: address,
          gasPrice: GAS_PRICE,
        });
        await transaction.waitReceipt();
        // console.log(receipt);
        return { success: true, message: "" };
      }
    );
    return actionResult[1];
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
    return { success: false, message: errorString };
  }
};

export const finalizeAuction = async (
  performActions: (
    ...operations: ((kit: ContractKit) => any | Promise<any>)[]
  ) => Promise<any[]>,
  tokenId: number
) => {
  try {
    const actionResult = await performActions(async (kit: ContractKit) => {
      const address = kit.defaultAccount;
      const marketAddress = config.marketContractAddress;
      if (!marketAddress) return false;

      const stableToken = await kit.contracts.getStableToken(
        "cUSD" as StableToken
      );
      const marketInstance = getMarketInstance(kit, marketAddress);
      const transactionObject = await marketInstance.methods.endAuction(
        tokenId
      );
      const transaction = await kit.sendTransactionObject(transactionObject, {
        feeCurrency: stableToken.address,
        from: address,
        gasPrice: GAS_PRICE,
      });
      await transaction.waitReceipt();
      // console.log(receipt);
      return true;
    });
    return actionResult[0];
  } catch (error) {
    console.error(error);
    return false;
  }
};
