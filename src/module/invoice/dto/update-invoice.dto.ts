import { CreateCartItemDto } from "src/module/cart_item/dto/create-cart-item.dto";
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCartItemDto extends PartialType(CreateCartItemDto) {}