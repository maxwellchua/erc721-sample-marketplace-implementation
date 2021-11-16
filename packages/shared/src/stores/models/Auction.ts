import { Model, model, prop } from "mobx-keystone";

@model("monofu/Auction")
class Auction extends Model({
  id: prop<number>(),
  startDate: prop<Date>(),
  endDate: prop<Date>(),
  startingBiddingPrice: prop<number>(),
  currentBiddingPrice: prop<number>(),
  highestBidderId: prop<number | null>(),
}) {}

export default Auction;
