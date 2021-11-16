import { APIAuction, APIItemCollectible } from "api/tokens";
import { Model, model, prop } from "mobx-keystone";

@model("monofu/ItemToken")
class ItemToken extends Model({
  id: prop<number>(),
  onSale: prop<boolean>(),
  price: prop<number>(),
  sellType: prop<number>(),
  auction: prop<APIAuction | null>(),
  collectible: prop<APIItemCollectible>(),
  owner: prop<number>(),
  ownerName: prop<string>(),
  supply: prop<number>(),
  tokenNumber: prop<number>(),
  mintId: prop<number>(),
}) {}

export default ItemToken;
