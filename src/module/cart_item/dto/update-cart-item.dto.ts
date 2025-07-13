import { CreateCartItemDto } from "./create-cart-item.dto";
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCartItemDto extends PartialType(CreateCartItemDto) {}