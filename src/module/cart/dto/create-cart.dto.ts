import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CartStatus } from '../entities/cart.entity';


export class CreateCartDto {

    @IsNumber()
    userId: number;

    @IsNotEmpty()
    @IsString()
    totalPrice: string;

    @IsEnum(CartStatus)
    status: CartStatus;
   
     

}
