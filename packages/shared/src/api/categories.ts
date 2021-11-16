import config from "../config";
import { callApi } from "./base";

export const fetchCategoryList = async () => callApi(config.urls.category);
