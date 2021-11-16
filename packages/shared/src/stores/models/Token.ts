import { Model, model, prop } from "mobx-keystone";

import Auction from "./Auction";

@model("monofu/Token")
export default class Token extends Model({
  id: prop<number>(),
  onSale: prop<boolean>(),
  price: prop<number>(),
  sellType: prop<number>(),
  auction: prop<Auction | null>(),
}) {}
