import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

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

    @IsNumber()
    userId: number;
}