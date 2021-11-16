import { SellType } from "utils/constants";

export interface ModalFormData {
  price?: number;
  sellType?: SellType;
  startDate?: Date;
  endDate?: Date;
}
