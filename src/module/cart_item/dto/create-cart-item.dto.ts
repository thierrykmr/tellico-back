import { IsNotEmpty, IsNumber, IsOptional} from 'class-validator';

export class CreateCartItemDto {

    @IsNotEmpty()
    @IsNumber()
    quantity: number;
 
    @IsOptional()
    @IsNumber()
    cartId?: number;

    // userId sera injecté automatiquement depuis le token d'authentification
    // productId sera fourni via l'URL du endpoint
    
}