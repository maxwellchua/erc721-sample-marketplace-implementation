import { computed } from "mobx";
import { arraySet, Model, model, prop } from "mobx-keystone";

import Token from "./Token";

@model("monofu/Item")
export default class Item extends Model({
  id: prop<number>(),
  contractAddress: prop<string>(),
  file1: prop<string | undefined>(undefined),
  files: prop<string[]>(() => []),
  coverImg: prop<string | undefined>(undefined),
  tokenAmt: prop<number>(),
  tokenSold: prop<number>(),
  title: prop<string>(),
  description: prop<string>(),
  itemId: prop<string>(),
  creator: prop<number>(),
  creatorName: prop<string>(),
  royalties: prop<number>(),
  category: prop<number>(),
  tokens: prop(() => arraySet<Token>()),
  is360Video: prop<boolean>(),
}) {
  @computed
  get currentToken() {
    const tokens = Array.from(this.tokens.values());
    if (tokens.length > 0) {
      return tokens[0];
    }
    return null;
  }

  @computed
  get onSale() {
    const item = this.currentToken;
    if (item) {
      return item.onSale;
    }
    return false;
  }

  @computed
  get sellType() {
    const item = this.currentToken;
    if (item) {
      return item.sellType;
    }
    return 0;
  }
}
