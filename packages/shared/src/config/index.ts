import { isString, merge } from "lodash";
import base from "./base";
import dev from "./dev";
import prod from "./prod";

const getConfig = (env = "development") =>
  merge(
    base,
    !isString(env) || env.indexOf("development") >= 0 ? dev : {},
    isString(env) && env.indexOf("production") !== -1 ? prod : {}
  );

const config = getConfig(process.env.APP_CONFIG || process.env.NODE_ENV);
// console.log({ config });

export default config;
