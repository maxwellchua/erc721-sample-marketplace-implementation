const config = {
  debug: false,
  tokenKey: process.env.AUTH_TOKEN_KEY || "TOKEN_KEY",
  marketContractAddress: process.env.APP_MARKET_CONTRACT_ADDRESS || "",
  marketCommissionRecipient: process.env.APP_MARKET_COMMISSION_RECIPIENT || "",
  webSecretKey: process.env.WEB_SECRET_KEY,
  urls: {
    api: process.env.APP_API_URL!,
    web: process.env.APP_WEB_URL!,
    auth: "/auth/",
    user: "/users/",
    subscribe: "/users/subscribe/",
    category: "/categories/",
    item: "/items/",
    token: "/tokens/",
    metadata: "/metadata/",
  },
};

export default config;
