export const ROUTES = Object.freeze({
  root: "/",

  collectiblesList: "/collectibles",
  collectiblesCreate: "/collectibles/new",
  // collectiblesDetail: (collectibleId: number | string) =>
  //   `/collectibles/${collectibleId}`,
  collectiblesTokenDetail: (tokenId: number | string) =>
    `/collectibles/token/${tokenId}`,
  connect: "/connect",
  connectCeloExtensionWallet: "/connect/celo-extension-wallet",
  connectCeloWallet: "/connect/celo-wallet",
  connectMetaMask: "/connect/metamask",
  login: "/login",
  usersDetail: (userId: number | string) => `/users/${userId}`,
  userEditProfile: "/users/profile",
  usersCollectibles: (userId: number | string) => `/users/${userId}#created`,
  // wallet: "/wallet",

  staticHowItWorks: "/how-it-works",
  staticPrivacy: "/privacy-policy",
  staticTerms: "/terms",
  staticFaqs: "/faqs",
  staticOurMission: "/our-mission",
});
