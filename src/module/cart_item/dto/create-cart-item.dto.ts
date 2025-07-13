import { IsNotEmpty, IsNumber} from 'class-validator';

export class CreateCartItemDto {

    @IsNotEmpty()
    @IsNumber()
    quantity: number;
    
    @IsNumber()
    productId: number;
 
    @IsNumber()
    cartId: number;
    
}