import { ContractKit, StableToken } from "@celo/contractkit";
import { Connector } from "@celo-tools/use-contractkit";
import Web3 from "web3";

import RootStore from "@monofu/shared/lib/stores/RootStore";

export const login = async (conn: Connector, store: RootStore) => {
  const {
    users: { current: currentUser },
  } = store;
  const address = conn.kit.defaultAccount;
  if (!address) {
    return undefined;
  }

  if (currentUser) {
    const user = await store.users.updateWalletToken(currentUser.token, {
      walletToken: address,
    });
    return user;
  }
  return currentUser;
};

export const updateBalance = async (
  kit: ContractKit,
  store: RootStore,
  address: string
) => {
  const [goldToken, stableToken] = await Promise.all([
    kit.contracts.getGoldToken(),
    kit.contracts.getStableToken("cUSD" as StableToken),
  ]);
  const [celo, cUSD] = await Promise.all([
    goldToken.balanceOf(address),
    stableToken.balanceOf(address),
  ]);
  const celoBalance = parseFloat(Web3.utils.fromWei(celo.toString())).toFixed(
    2
  );
  const cUSDBalance = parseFloat(Web3.utils.fromWei(cUSD.toString())).toFixed(
    2
  );
  // Temporary display CELO Balance instead of CUSD
  store.users.setBalance(celoBalance.toString(), cUSDBalance.toString());
};
