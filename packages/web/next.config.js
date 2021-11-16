module.exports = {
  env: {
    APP_CONFIG: process.env.APP_CONFIG,
    APP_API_URL: process.env.APP_API_URL,
    APP_WEB_URL: process.env.APP_WEB_URL,
    APP_MARKET_CONTRACT_ADDRESS: process.env.APP_MARKET_CONTRACT_ADDRESS,
    APP_MARKET_COMMISSION_RECIPIENT:
      process.env.APP_MARKET_COMMISSION_RECIPIENT,
    WEB_SECRET_KEY: process.env.WEB_SECRET_KEY,
  },
  future: {
    webpack5: true,
  },
  webpack: (config, { isServer }) => {
    const rulesStyles = config.module.rules[2];
    const rulesStylesModules = rulesStyles.oneOf[3];

    rulesStylesModules.use.push({
      loader: "sass-resources-loader",
      options: {
        resources: [
          "./styles/variables.scss",
          "./styles/vendors/bootstrap_base.scss",
          "./styles/mixins.scss",
        ],
      },
    });

    if (!isServer) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.net = false;
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};
