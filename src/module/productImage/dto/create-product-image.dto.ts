import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductImageDto {
    
    @IsNotEmpty()
    @IsString()
    url: string;

    @IsBoolean()
    isMain: boolean;

    @IsString()
    @IsOptional()
    altText?: string;

    @IsNumber()
    productId: number;
}