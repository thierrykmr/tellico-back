import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    price: string;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number) // Pour la transformation automatique depuis string
    @IsPositive({ message: 'La quantité doit être positive' })
    quantity: number;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    promotionRate?: string;

    // @IsNumber()
    // userId: number;
    //  il sera récupéré depuis le token JWT via req.user.sub
}