import { CreateCartDto } from "./create-cart.dto";
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCartDto extends PartialType(CreateCartDto) {}