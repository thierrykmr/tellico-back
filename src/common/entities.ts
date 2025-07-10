import { UserEntity } from "src/module/user/entities/user.entity";
import { ProductEntity } from "src/module/product/entities/product.entity";
import { ProductImageEntity } from "src/module/productImage/entities/productImage.entity";
import { CartEntity } from "src/module/cart/entities/cart.entity";
import { CartItemEntity } from "src/module/cart_item/entities/cart_item.entity";
import { HistoryEntity } from "src/module/history/entities/history.entity";
import { ComplaintEntity } from "src/module/complaint/entities/complaint.entity";
import { SupportRequestEntity } from "src/module/supportRequest/entities/supportRequest.entity";
import { InvoiceEntity } from "src/module/invoice/entities/invoice.entity";
import { InvoiceItemEntity } from "src/module/invoice_item/entities/invoice_item.entity";

export const entities = [
  UserEntity,
  ProductEntity,
  ProductImageEntity,
  CartEntity,
  CartItemEntity,
  HistoryEntity,
  ComplaintEntity,
  SupportRequestEntity,
  InvoiceEntity,
  InvoiceItemEntity,
];