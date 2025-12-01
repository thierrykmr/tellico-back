import { CreateCartDto } from "./create-cart.dto";
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from "class-validator";
import { CartStatus } from "../entities/cart.entity";

export class UpdateCartDto extends PartialType(CreateCartDto) {
  @IsOptional()
  @IsString()
  totalPrice?: string;

  @IsOptional()
  @IsEnum(CartStatus, { message: 'Le statut doit être: open, ordered ou cancelled' })
  status?: CartStatus;
}