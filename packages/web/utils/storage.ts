import localforage from "localforage";

const storage = localforage.createInstance({ name: "monofu" });

export const storageKeySnapshot = "snapshot";

export default storage;
