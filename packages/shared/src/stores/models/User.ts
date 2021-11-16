import { Model, model, prop } from "mobx-keystone";

@model("monofu/User")
export default class User extends Model({
  id: prop<number>(),
  isSuperuser: prop<boolean>(false),
  commissionRate: prop<number>(5),
  token: prop<string>(""),
  address: prop<string>(""),
  profileImage: prop<string | null>(null),
  coverImage: prop<string | null>(null),
  celoBalance: prop<string>(""),
  cUSDBalance: prop<string>(""),
  description: prop<string>(""),
  firstName: prop<string>(""),
  lastName: prop<string>(""),
  displayName: prop<string>(""),
  twitter: prop<string>(""),
  instagram: prop<string>(""),
  messenger: prop<string>(""),
  website: prop<string>(""),
}) {}
