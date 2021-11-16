import { Model, model, prop } from "mobx-keystone";

@model("monofu/Category")
export default class Category extends Model({
  id: prop<number>(),
  name: prop<string>(""),
}) {}
