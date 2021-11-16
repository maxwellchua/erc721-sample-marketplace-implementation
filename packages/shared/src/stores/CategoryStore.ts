import {
  _async,
  _await,
  Model,
  model,
  modelFlow,
  objectMap,
  prop,
} from "mobx-keystone";

import api from "../api";
import Category from "./models/Category";

@model("monofu/CategoryStore")
export default class CategoryStore extends Model({
  map: prop(() => objectMap<Category>()),
}) {
  @modelFlow
  fetchCategoryList = _async(function* (this: CategoryStore) {
    let entities: { results: Category[] };
    try {
      ({
        response: { entities },
      } = yield api.categories.fetchCategoryList());
    } catch (error) {
      console.log("[DEBUG] error", error);
      return;
    }

    const { results: categories } = entities;
    categories.forEach((data) => {
      try {
        const category = new Category(data);
        this.map.set(`${category.id}`, category);
      } catch (error) {
        console.log("[DEBUG] error", error);
        return;
      }
    });
  });
}
